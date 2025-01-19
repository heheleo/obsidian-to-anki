import ObsidianToAnkiPlugin from 'src/main';
import { SettingsCategory } from '../category';
import { Setting } from 'obsidian';

export default class FilesCategory extends SettingsCategory {
	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin);
	}

	display(container: HTMLElement): void {
		new Setting(container)
			.setName('Folders to include')
			.setDesc(
				"Relative to the vault's root. Separate multiple folders names with commas. Empty means search all files. e.g. 'Biology, Math'"
			)
			.addText((text) =>
				text
					.setPlaceholder('Enter folder names, seperated by commas')
					.setValue(this.plugin.settings.directories)
					.onChange(async (value) => {
						this.plugin.settings.directories = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
