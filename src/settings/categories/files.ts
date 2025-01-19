import ObsidianToAnkiPlugin from 'src/main';
import { SettingsCategory } from '../category';

export default class FilesCategory extends SettingsCategory {
	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin);
	}

	display(container: HTMLElement): void {}
}
