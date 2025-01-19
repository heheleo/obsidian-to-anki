import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	configureSettingTabs
} from './settings';

/**
 * The default class which is exported from the main file of the plugin.
 */
export default class ObsidianToAnkiPlugin extends Plugin {
	/**
	 * The settings object for the plugin.
	 */
	settings: PluginSettings;

	async onload() {
		// Load the settings:
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		// Add the settings tabs:
		configureSettingTabs(this);
	}

	onunload() {}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
