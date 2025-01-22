import type { Note } from 'src/parser';
import { DEFAULT_SETTINGS, type PluginSettings } from 'src/settings/defaults';
import { serialiseNote } from '../serialising';

/**
 * Checks if notes can be added to Anki with error details.
 * @param settings - The plugin settings.
 * @param notes - The notes to be added.
 * @returns An array of objects containing the canAdd status and error message.
 * @throws If there is an error in the AnkiConnect response.
 */
export async function ankiConnectCanAddNotesWithErrorDetail(
	settings: PluginSettings,
	notes: Note[]
) {
	// Get the port from the settings, or use the default port:
	const port = settings?.ankiConnectPort || DEFAULT_SETTINGS.ankiConnectPort;
	// Construct the request URL:
	const requestURL = `http://localhost:${port}`;
	const request = await fetch(requestURL, {
		method: 'POST',
		body: JSON.stringify({
			action: 'canAddNotesWithErrorDetail',
			version: 6,
			params: {
				notes: notes.map((note) => serialiseNote(note))
			}
		})
	});

	// Parse the response:
	const response = await request.json();

	// Check if the response is an error:
	if (
		response?.error ||
		response?.result === null ||
		!Array.isArray(response?.result)
	) {
		throw new Error(response.error);
	}

	return response.result as { canAdd: boolean; error: string }[];
}
