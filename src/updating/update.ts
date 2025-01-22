import { ItemView, WorkspaceLeaf } from 'obsidian';
import { mount, unmount } from 'svelte';
import UpdatingModal from './UpdatingModal.svelte';
import type ObsidianToAnkiPlugin from 'src/main';

export const VIEW_TYPE = 'anki-export';

export class UpdatingView extends ItemView {
	/**
	 * The plugin instance.
	 */
	private plugin: ObsidianToAnkiPlugin;
	/**
	 * The Svelte component instance.
	 */
	private component: ReturnType<typeof UpdatingModal> | undefined = undefined;

	constructor(leaf: WorkspaceLeaf, plugin: ObsidianToAnkiPlugin) {
		super(leaf);

		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return 'Anki Export';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		// Mount the Svelte component:
		this.component = mount(UpdatingModal, {
			target: container,
			props: {
				settings: this.plugin.settings,
				app: this.plugin.app,
				fileCaptureType: this.plugin.captureAllNotes ? 'all' : 'current'
			}
		});
	}

	async onClose() {
		if (this.component) {
			// Unmount the Svelte component:
			unmount(this.component);
		}
	}
}
