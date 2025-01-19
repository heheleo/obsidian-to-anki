import ObsidianToAnkiPlugin from 'src/main';
import { SettingsCategory } from '../category';

export default class AnkiCategory extends SettingsCategory {
	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin);
	}

	display(container: HTMLElement): void {}
}
