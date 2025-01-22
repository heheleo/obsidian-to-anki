import type { Note } from 'src/parser';
import { DEFAULT_SETTINGS, type PluginSettings } from 'src/settings/defaults';
import { serialiseNote } from '../serialising';

/**
 * Adds a note to Anki using AnkiConnect.
 * @param settings - The plugin settings.
 * @param note - The note to be added.
 * @returns A boolean indicating whether the note was successfully added.
 */
export async function ankiConnectAddNote(settings: PluginSettings, note: Note) {
	// Get the port from the settings, or use the default port:
	const port = settings?.ankiConnectPort || DEFAULT_SETTINGS.ankiConnectPort;
	// Construct the request URL:
	const requestURL = `http://localhost:${port}`;

	const request = await fetch(requestURL, {
		method: 'POST',
		body: JSON.stringify({
			action: 'addNote',
			version: 6,
			params: {
				note: serialiseNote(note)
			}
		})
	});

	// Parse the response:
	const response = await request.json();

	// Check if the response is an error:
	if (response?.error || response?.result === null) {
		throw new Error(response.error);
	}

	return true;
}
