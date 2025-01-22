import { Plugin, WorkspaceLeaf } from 'obsidian';
import { UpdateAllCommand } from './commands/updateAll';
import { UpdateCurrentFileCommand } from './commands/updateCurrentFile';
import { configureSettingTabs } from './settings';
import { DEFAULT_SETTINGS, type PluginSettings } from './settings/defaults';
import { UpdatingView, VIEW_TYPE } from './updating/update';

/**
 * The default class which is exported from the main file of the plugin.
 */
export default class ObsidianToAnkiPlugin extends Plugin {
	/**
	 * The settings object for the plugin.
	 */
	settings: PluginSettings;
	/**
	 * Whether to capture all notes, or only the current file.
	 */
	captureAllNotes: boolean = false;

	async onload() {
		// Load the settings:
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		// Add the settings tabs:
		configureSettingTabs(this);

		// Add the views:
		this.registerView(VIEW_TYPE, (leaf) => new UpdatingView(leaf, this));

		// Add the commands:
		this.addCommand(UpdateAllCommand(this));
		this.addCommand(UpdateCurrentFileCommand(this));
	}

	onunload() {}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE);

		if (leaves?.[0]) {
			// A leaf with our view already exists, use that:
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf:
			leaf = workspace.getRightLeaf(false);
			if (leaf)
				await leaf.setViewState({
					type: VIEW_TYPE,
					active: true
				});
		}

		// Reveal the leaf in case it is in a collapsed sidebar:
		if (leaf) workspace.revealLeaf(leaf);
	}
}
