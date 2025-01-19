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

		// Note Beginning:
		new Setting(container)
			.setName('Note Beginning')
			.setDesc(
				"The text to search for which marks the beginning of a new Anki note. e.g. 'START ANKI', '# Anki'"
			)
			.addText((text) =>
				text
					.setPlaceholder('## Anki')
					.setValue(this.plugin.settings.noteBeginning)
					.onChange((value) =>
						this.updateAndSaveSetting('noteBeginning', value)
					)
			);

		// Note Ending:
		new Setting(container)
			.setName('Note Ending')
			.setDesc(
				"The text to search for which marks the end of a new Anki note. e.g. 'END ANKI', '---'"
			)
			.addText((text) =>
				text
					.setPlaceholder('Anki End')
					.setValue(this.plugin.settings.noteEnding)
					.onChange((value) =>
						this.updateAndSaveSetting('noteEnding', value)
					)
			);

		// Note Type beginning:
		new Setting(container)
			.setName('Note Type Beginning')
			.setDesc(
				"The text to search for which specifies what note type the note belongs to. e.g. 'Type:', 'Note Type:'"
			)
			.addText((text) =>
				text
					.setPlaceholder('')
					.setValue(this.plugin.settings.noteTypeBeginning)
					.onChange((value) =>
						this.updateAndSaveSetting('noteTypeBeginning', value)
					)
			);

		// Deck beginning:
		new Setting(container)
			.setName('Deck Beginning')
			.setDesc(
				"The text to search for which specifies what deck the note belongs to. e.g. 'Deck:', 'Store note in'"
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
				'If you do not specify the deck, which deck should the note go to?'
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
