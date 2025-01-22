<script lang="ts">
	import { TFile, type App } from 'obsidian';
	import {
		extractNotes,
		extractNotesFromTFiles,
		type Note,
		type ParserError
	} from 'src/parser';
	import {
		DEFAULT_SETTINGS,
		type PluginSettings
	} from 'src/settings/defaults';
	import { AnkiConnectAPI } from 'src/utils/ankiconnect';
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { UpdateStepsStore } from './UpdateStepsStore';

	interface Props {
		/**
		 * The settings of the plugin.
		 */
		settings: PluginSettings;
		/**
		 * The Obsidian application instance.
		 */
		app: App;
		/**
		 * Whether to update all files or only the current file.
		 */
		fileCaptureType: 'current' | 'all';
	}

	/**
	 * This interface merely adds an identifier (file URL) to any parsing error.
	 * This makes it easier to identify which file caused the error.
	 */
	interface FileParsingError {
		/**
		 * The path of the file, relative to the vault's root, given by Obsidian.
		 */
		filePath: string;
		/**
		 * The actual error that occurred during the parsing process.
		 */
		error: ParserError;
	}

	const { settings, app, fileCaptureType }: Props = $props();

	// The current step of the updating process:
	let currentStep = $state<string>('connect');
	let updatingState = $state<'updating' | 'error' | 'success'>('updating');
	// The errors that occurred during the parsing process:
	let fileParsingErrors = $state<FileParsingError[]>([]);

	onMount(() => {
		update();
	});

	/**
	 * Starts the updating process.
	 */
	async function update() {
		// Start steps of the updating process:
		// Step 1: Connect to AnkiConnect
		// Fetch deck names from Anki, which demonstrates that AnkiConnect can be connected.
		const now = performance.now();
		const deckNames = await AnkiConnectAPI.getDecknames(settings).catch(
			(error) => {
				// This step has failed.
				if (error instanceof Error) {
					console.error(`Error fetching DeckNames:`, error.message);
				}
				return null;
			}
		);

		if (!deckNames || !Array.isArray(deckNames)) {
			const port =
				settings?.ankiConnectPort || DEFAULT_SETTINGS.ankiConnectPort;

			UpdateStepsStore.setStepError(
				'connect',
				`Failed to connect to AnkiConnect. Is Anki open, and is AnkiConnect installed and running? (port ${port})`
			);

			updatingState = 'error';

			return;
		}

		UpdateStepsStore.setStepCompletion(
			'connect',
			`Connected to AnkiConnect after ${(performance.now() - now).toFixed(
				2
			)}ms`
		);

		// Step 2: Parse notes
		currentStep = 'parse';
		// Parse notes from the current document.
		const allFiles =
			fileCaptureType === 'all'
				? app.vault
						.getFiles()
						.filter((file) =>
							settings.directories
								.split(',')
								.some((dir) => file.path.startsWith(dir))
						)
				: [app.workspace.getActiveFile()];

		// Read the note files:
		const notes: Note[] = [];

		for (const file of allFiles) {
			if (!file) continue;
			const text = await app.vault.read(file);
			const { notes: extractedNotes, errors } = extractNotes(
				text,
				settings
			);
			notes.push(
				...extractedNotes.map((note) => ({
					...note,
					filePath: file.path
				}))
			);
			fileParsingErrors.push(
				...errors.map((error) => ({
					filePath: file.path,
					error
				}))
			);
		}

		const actualErrors = fileParsingErrors.filter(
			({ error }) => error.type === 'error'
		);
		const actualWarnings = fileParsingErrors.filter(
			({ error }) => error.type === 'warning'
		);

		// Check if there are any errors:
		if (actualErrors.length) {
			updatingState = 'error';
			UpdateStepsStore.setStepError(
				'parse',
				`There seems to be ${actualErrors.length} error${
					actualErrors.length === 1 ? '' : 's'
				} in the document. Fix them before continuing.`
			);
		} else if (actualWarnings.length) {
			// There are warnings:
			UpdateStepsStore.setStepCompletion(
				'parse',
				`Parsed ${notes.length} note${notes.length === 1 ? '' : 's'} from the document. There are warnings present.`
			);
		} else {
			// No errors:
			UpdateStepsStore.setStepCompletion(
				'parse',
				`Parsed ${notes.length} note${notes.length === 1 ? '' : 's'} from the document.`
			);
		}

		if (updatingState === 'error') return;

		// Step 3: Validate notes
		// This step includes verifying the deck exists in Anki
		currentStep = 'validate';

		for (const note of notes) {
			const deckExists = deckNames.includes(note.deck);
			if (!deckExists && note.filePath) {
				fileParsingErrors.push({
					filePath: note.filePath,
					error: {
						type: 'error',
						message: `Deck "${note.deck}" does not exist in Anki.`
					}
				});
				updatingState = 'error';
			}
		}

		if (updatingState === 'error') {
			UpdateStepsStore.setStepError(
				'validate',
				`Some notes have errors. Please fix them before continuing.`
			);
		} else {
			UpdateStepsStore.setStepCompletion(
				'validate',
				`All notes are valid.`
			);
		}

		if (updatingState === 'error') return;

		// Step 4: Update notes
		currentStep = 'update';

		// Update the notes in Anki:
		const toUpdate: Note[] = [];
		const toAdd: Note[] = [];

		// Check if the notes can be added:
		const canAddNotes = await AnkiConnectAPI.canAddNotesWithErrorDetail(
			settings,
			notes
		).catch((error) => {
			// This step has failed.
			if (error instanceof Error) {
				console.error(
					`Error checking if notes can be added:`,
					error.message
				);
			}
			return null;
		});

		if (!canAddNotes) {
			UpdateStepsStore.setStepError(
				'update',
				`Failed to add notes to Anki.`
			);
			updatingState = 'error';
		}

		for (var i = 0; i < notes.length; i++) {
			const note = notes[i];
			const canAdd = canAddNotes?.[i];
			if (!canAdd) break;

			if (canAdd.canAdd) {
				toAdd.push(note);
			} else if (canAdd.error.contains('duplicate')) {
				toUpdate.push(note);
			} else {
				console.error(`Unknown canAdd error: ${canAdd.error}`);
			}
		}

		if (updatingState === 'error') return;

		UpdateStepsStore.setStepCompletion(
			'update',
			`Updated ${notes.length} note${notes.length === 1 ? '' : 's'} in Anki.`
		);

		// Add the notes:
		const addNoteRequest = await AnkiConnectAPI.addNotes(settings, toAdd);
		// Check if the returned identifiers are the same length as the notes to add:
		if (addNoteRequest.length !== toAdd.length) {
			UpdateStepsStore.setStepError(
				'update',
				`Failed to add notes to Anki.`
			);
			updatingState = 'error';
		}

		for (const noteToUpdate of toUpdate) {
			// Find the identifier of the note to update:
			const identifiers = await AnkiConnectAPI.findNotes(
				settings,
				noteToUpdate
			);
			if (
				!identifiers ||
				!Array.isArray(identifiers) ||
				!identifiers.length
			) {
				UpdateStepsStore.setStepError(
					'update',
					`Failed to find note to update in Anki.`
				);
				updatingState = 'error';
				break;
			}

			if (identifiers.length > 1) {
				console.error(
					'More than one note found with the same content. This is unexpected.'
				);
				console.log(identifiers);
				continue;
			}

			// Update the note:
			const updateNoteRequest = await AnkiConnectAPI.updateNote(
				settings,
				identifiers[0],
				noteToUpdate
			);
			if (!updateNoteRequest) {
				UpdateStepsStore.setStepError(
					'update',
					`Failed to update note in Anki.`
				);
				updatingState = 'error';
				break;
			}
		}

		if (updatingState === 'error') return;
		UpdateStepsStore.setStepCompletion(
			'update',
			`Added ${toAdd.length} | Updated ${toUpdate.length}`
		);

		// Step 5: Complete
		updatingState = 'success';
		currentStep = 'complete';
		UpdateStepsStore.setStepCompletion(
			'complete',
			`All steps completed successfully after ${(performance.now() - now).toFixed(1)}ms`
		);
	}

	/**
	 * Opens a file in the Obsidian workspace,
	 * given its path relative to the vault's root.
	 * @param path The path of the file to open.
	 */
	function openFile(path: string) {
		const file = app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			app.workspace.getLeaf().openFile(file);
		}
	}

	/**
	 * Attempt to retry the updating process.
	 */
	function retry() {
		if (updatingState === 'updating') return;
		UpdateStepsStore.clear();
		fileParsingErrors = [];
		updatingState = 'updating';
		update();
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex gap-2">
		{#if updatingState === 'success'}
			<Icon icon="check" class="size-5 text-green-300" />
		{:else if updatingState === 'updating'}
			<Icon icon="loader-circle" class="size-5 animate-spin" />
		{:else if updatingState === 'error'}
			<Icon icon="x" class="size-5 text-red-300" />
		{/if}

		<span class="text-xl">Updating Anki cards...</span>
	</div>

	<hr />

	<div class="flex flex-col gap-2 text-sm">
		<span>
			{#if fileCaptureType === 'current'}
				Updating current file...
			{:else}
				Updating all files
			{/if}
		</span>
		{#each $UpdateStepsStore as step, index}
			<div class="flex gap-2 items-center">
				{#if step.error}
					<!-- This step has failed -->
					<Icon icon="x" class="size-4 text-red-300" />
				{:else if index < $UpdateStepsStore.findIndex((s) => s.id === currentStep) || currentStep === 'complete'}
					<!-- The step is completed -->
					<Icon icon="check" class="size-4 text-green-300" />
				{:else if currentStep === step.id}
					<!-- This step is commencing -->
					<Icon
						icon="loader-circle"
						class="size-4 text-blue-300 animate-spin"
					/>
				{:else}
					<!-- The step is pending -->
					<Icon icon="dot" class="size-4" />
				{/if}

				<div class="flex flex-col">
					{#if currentStep === step.id}
						<span class="font-bold">{step.title}</span>
					{:else}
						<span>{step.title}</span>
					{/if}
					<span class="text-xs text-gray-500">
						{step.completion_description}
					</span>

					<span class="text-xs text-red-500">
						{step.error}
					</span>
				</div>
			</div>
		{/each}
	</div>

	<button class="my-2" onclick={retry}>
		<Icon icon="rotate-ccw" class="size-3 mr-2" />
		<span class="text-sm">Redo</span>
	</button>

	{#if fileParsingErrors.length}
		<hr class="my-2" />
		<span>Errors</span>
		<div class="flex flex-col gap-2 mt-2">
			{#each fileParsingErrors as { filePath, error }}
				<div
					class="bg-opacity-65 flex flex-col p-2 rounded-xl text-white text-sm"
					class:o2a-warning-card={error.type === 'warning'}
					class:o2a-error-card={error.type === 'error'}
				>
					<div class="flex gap-2 items-center text-sm">
						{#if error.type === 'error'}
							<Icon icon="octagon-x" class="size-4" />
							<span>Error</span>
						{:else if error.type === 'warning'}
							<Icon icon="triangle-alert" class="size-4" />
							<span>Warning</span>
						{/if}

						<div class="ml-auto">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								onclick={() => openFile(filePath)}
								class="underline cursor-pointer"
							>
								Go to File
							</div>
						</div>
					</div>

					<div class="text-xs flex flex-col">
						<span>{error.message}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.o2a-warning-card {
		background-color: rgba(255, 234, 0, 0.706);
	}

	.o2a-error-card {
		background-color: rgba(252, 101, 81, 0.699);
	}
</style>
