import ObsidianToAnkiPlugin from 'src/main';
import { SettingsCategory } from '../category';
import { Setting } from 'obsidian';

export default class ParsingCategory extends SettingsCategory {
	constructor(plugin: ObsidianToAnkiPlugin) {
		super(plugin);
	}

	display(container: HTMLElement): void {
		// Add exact match disclaimer:
		container.createDiv({
			text: "Note: All text matching is case-insensitive and exact. If you're having trouble, try copying the text directly from the source.",
			cls: 'o2a-emphasis'
		});

		// Card Beginning:
		new Setting(container)
			.setName('Card Beginning')
			.setDesc(
				"The text to search for which marks the beginning of a new Anki card. e.g. 'START ANKI', '# Anki'"
			)
			.addText((text) =>
				text
					.setPlaceholder('## Anki')
					.setValue(this.plugin.settings.cardBeginning)
					.onChange((value) =>
						this.updateAndSaveSetting('cardBeginning', value)
					)
			);

		// Card Ending:
		new Setting(container)
			.setName('Card Ending')
			.setDesc(
				"The text to search for which marks the end of a new Anki card. e.g. 'END ANKI', '---'"
			)
			.addText((text) =>
				text
					.setPlaceholder('Anki End')
					.setValue(this.plugin.settings.cardEnding)
					.onChange((value) =>
						this.updateAndSaveSetting('cardEnding', value)
					)
			);

		// Card Type beginning:
		new Setting(container)
			.setName('Card Type Beginning')
			.setDesc(
				"The text to search for which specifies what card type the card belongs to. e.g. 'Type:', 'Card Type:'"
			)
			.addText((text) =>
				text
					.setPlaceholder('')
					.setValue(this.plugin.settings.cardTypeBeginning)
					.onChange((value) =>
						this.updateAndSaveSetting('cardTypeBeginning', value)
					)
			);

		// Deck beginning:
		new Setting(container)
			.setName('Deck Beginning')
			.setDesc(
				"The text to search for which specifies what deck the card belongs to. e.g. 'Deck:', 'Store card in'"
			)
			.addText((text) =>
				text
					.setPlaceholder('Deck:')
					.setValue(this.plugin.settings.deckBeginning)
					.onChange((value) =>
						this.updateAndSaveSetting('deckBeginning', value)
					)
			);

		// Default Deck:
		new Setting(container)
			.setName('Default Deck')
			.setDesc(
				'If you do not specify the deck, which deck should the card go to?'
			)
			.addText((text) =>
				text
					.setPlaceholder('')
					.setValue(this.plugin.settings.defaultDeck)
					.onChange((value) =>
						this.updateAndSaveSetting('defaultDeck', value)
					)
			);
	}
}
