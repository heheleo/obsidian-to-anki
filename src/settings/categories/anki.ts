import ObsidianToAnkiPlugin from 'src/main';
import { SettingsCategory } from '../category';
import { Setting } from 'obsidian';

export default class AnkiCategory extends SettingsCategory {
	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin);
	}

	display(container: HTMLElement): void {
		// Add danger disclaimer:
		const disclaimer = container.createDiv({
			text: 'Danger: these settings should not be touched unless you know what you are doing.',
			cls: 'o2a-emphasis'
		});
		disclaimer.setAttribute('type', 'danger');

		// AnkiConnect Port:
		new Setting(container)
			.setName('AnkiConnect Port')
			.setDesc(
				'The port number that AnkiConnect is running on. Default is 8765.'
			)
			.addText((text) =>
				text
					.setPlaceholder('8765')
					.setValue(this.plugin.settings.ankiConnectPort)
					.onChange((value) =>
						this.updateAndSaveSetting('ankiConnectPort', value)
					)
			);
	}
}
