import ObsidianToAnkiPlugin from 'src/main';
import { SettingsCategory } from '../category';

export default class HomeCategory extends SettingsCategory {
	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin);
	}

	display(container: HTMLElement): void {
		const centeredContainer = container.createDiv({
			cls: 'o2a-center-container'
		});

		const branding = centeredContainer.createDiv({
			text: 'Obsidian to Anki (beta)'
		});
		branding.style.fontSize = 'large';
		branding.style.fontWeight = 'bold';
		branding.style.textAlign = 'center';

		const text = centeredContainer.createDiv({
			text: 'Thank you for using this plugin.'
		});
		text.style.textAlign = 'center';
		text.style.marginTop = '10px';
		text.style.fontSize = 'medium';
	}
}
