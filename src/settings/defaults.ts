/**
 * Defines the default settings for the plugin.
 */

export const DEFAULT_SETTINGS: PluginSettings = {
	// Files:
	directories: '',

	// Parsing:
	noteBeginning: '## Anki',
	noteEnding: 'Anki End',
	deckBeginning: 'Deck:',
	defaultDeck: '',
	noteTypeBeginning: 'Card Type:',
	noteFrontBeginning: 'Front:',
	noteBackBeginning: 'Back:',

	// Anki:
	ankiConnectPort: '8765'
};
/**
 * Defines the settings for the plugin.
 */

export interface PluginSettings {
	// Files:
	directories: string;

	// Parsing:
	noteBeginning: string;
	noteEnding: string;
	deckBeginning: string;
	defaultDeck: string;
	noteTypeBeginning: string;
	noteFrontBeginning: string;
	noteBackBeginning: string;

	// Anki:
	ankiConnectPort: string;
}
