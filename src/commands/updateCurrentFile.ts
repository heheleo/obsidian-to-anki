import { type Command, MarkdownView } from 'obsidian';
import ObsidianToAnkiPlugin from 'src/main';

export function UpdateCurrentFileCommand(
	plugin: ObsidianToAnkiPlugin
): Command {
	return {
		id: 'c2a-update-current-file',
		name: 'Update notes within Anki for the current file',
		checkCallback: (checking: boolean) => {
			const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;

			// If we're checking, we're just seeing if we can run the command
			if (checking) return true;

			// If we're not checking, we're actually running the command
			plugin.captureAllNotes = false;
			plugin.activateView();
		}
	};
}
