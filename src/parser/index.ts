import { type PluginSettings } from 'src/settings/defaults';
import { parseBasicChunk } from './notetypes/basic';
import { parseClozeChunk } from './notetypes/cloze';

export type NoteType = 'Basic' | 'Cloze';
// | 'Basic (and reversed card)'
// | 'Basic (type in the answer)';

export interface Note {
	/**
	 * The front of the note.
	 */
	front: string;
	/**
	 * The back of the note. Note that this is optional as cloze notes do not
	 * have a back.
	 */
	back?: string;
	/**
	 * The type of the note.
	 */
	type: NoteType;
	/**
	 * The deck for which the note belongs to.
	 */
	deck: string;
}

export interface ParserError {
	/**
	 * The type of the error.
	 */
	type: 'warning' | 'error';
	/**
	 * The error message, a brief description of the error.
	 */
	message: string;
	/**
	 * Whether the error is fatal or not. If the error is fatal, the note
	 * should not be added to the collection.
	 */
	fatal?: boolean;
}

export const isParserError = (obj: any): obj is ParserError => {
	return obj?.type === 'warning' || (obj?.type === 'error' && obj?.message);
};

/**
 * Extracts notes from the given text.
 * @param text the text to extract notes from
 * @param settings the settings to use
 * @returns an array of notes and an array of errors
 */
export function extractNotes(
	text: string,
	settings: PluginSettings
): { notes: Note[]; errors: ParserError[] } {
	const lines = text.split('\n');

	const noteBeginning = settings.noteBeginning;
	const noteEnding = settings.noteEnding;

	const chunks: string[] = [];
	let chunk = '';
	for (var i = 0; i < lines.length; ++i) {
		const line = lines[i];
		// If we're at the beginning of a chunk, we need to start a new chunk
		if (line === noteBeginning) {
			// A previous chunk was not properly ended off by a note ending, so
			// we need to discard it
			if (chunk !== '') {
				chunk = '';
			}

			chunk += line + '\n';
			continue;
		}

		// If we're at the end of a chunk, we need to add it to the list of chunks
		if (line === noteEnding) {
			chunks.push(chunk);
			chunk = '';
			continue;
		}

		// If we're in the middle of a chunk, we need to add the line to the chunk
		if (chunk !== '') {
			chunk += line + '\n';
		}
	}

	const notes: Note[] = [];
	const allErrors: ParserError[] = [];
	for (const chunk of chunks) {
		const { note, errors } = parseChunk(chunk, settings);
		// If there are fatal errors, we should not add the note to the collection:
		if (errors.some((error) => error.fatal)) {
			allErrors.push(...errors);
			continue;
		}

		allErrors.push(...errors);
		notes.push(note);
	}

	return {
		notes,
		errors: allErrors
	};
}

/**
 * Given a chunk of text, this function will parse it and return a note.
 * @param chunk the chunk to parse
 * @param settings the settings to use
 * @returns
 */
export function parseChunk(
	chunk: string,
	settings: PluginSettings
): { note: Note; errors: ParserError[] } {
	const lines = chunk.split('\n');
	// Check if the chunk is empty:
	if (lines.length === 0) {
		throw new Error('The chunk is empty.');
	}

	const errors: ParserError[] = [];

	let type: NoteType = 'Basic';
	let deck: string = settings.defaultDeck;

	// Traverse once to find the type of the note, as parsing differs between a
	// card and a cloze. We can also find the deck of the note:
	for (var i = 0; i < lines.length; ++i) {
		const line = lines[i];
		// This is a type comment:
		if (line.startsWith(settings.noteTypeBeginning)) {
			if (type !== 'Basic') {
				// The user has already defined the type of the card,
				// so we should warn the user that the type is being overwritten.
				errors.push({
					type: 'warning',
					message:
						'The type of the card is being overwritten. (it has been likely defined twice.)'
				});
			}

			// Extract the type of the note:
			const typeString = line
				.substring(settings.noteTypeBeginning.length)
				.trim();

			// Check if the type is valid:
			if (
				typeString === 'Basic' ||
				typeString === 'Cloze' ||
				typeString === 'Basic (and reversed card)' ||
				typeString === 'Basic (type in the answer)'
			) {
				type = typeString as NoteType;
			} else {
				errors.push({
					type: 'error',
					message:
						'The type of the card is invalid. Returning to the last type defined.',
					fatal: false
				});
			}

			continue;
		}

		// This is a deck comment:
		if (line.startsWith(settings.deckBeginning)) {
			deck = line.substring(settings.deckBeginning.length).trim();
			continue;
		}
	}

	const parseResult =
		type === 'Cloze'
			? parseClozeChunk(lines, settings, deck)
			: parseBasicChunk(lines, settings, deck);

	if (parseResult.errors.length) {
		errors.push(...parseResult.errors);
	}

	return {
		note: parseResult.note,
		errors
	};
}
