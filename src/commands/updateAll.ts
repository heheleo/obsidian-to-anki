import type { Command } from 'obsidian';
import ObsidianToAnkiPlugin from 'src/main';

export function UpdateAllCommand(plugin: ObsidianToAnkiPlugin): Command {
	return {
		id: 'c2a-update-all',
		name: 'Update all notes within Anki',
		callback: () => {
			plugin.captureAllNotes = true;
			plugin.activateView();
		}
	};
}
