import type { Note } from 'src/parser';
import { DEFAULT_SETTINGS, type PluginSettings } from 'src/settings/defaults';
import { serialiseNote } from '../serialising';

/**
 * Updates a note in Anki using AnkiConnect.
 *
 * @param settings - The plugin settings.
 * @param noteID - The ID of the note to update.
 * @param newNote - The new note data.
 * @returns A boolean indicating whether the note was successfully updated.
 */
export async function ankiConnectUpdateNote(
	settings: PluginSettings,
	noteID: number,
	newNote: Note
) {
	// Get the port from the settings, or use the default port:
	const port = settings?.ankiConnectPort || DEFAULT_SETTINGS.ankiConnectPort;
	// Construct the request URL:
	const requestURL = `http://localhost:${port}`;

	const serialised = serialiseNote(newNote);

	const request = await fetch(requestURL, {
		method: 'POST',
		body: JSON.stringify({
			action: 'updateNote',
			version: 6,
			params: {
				note: {
					id: noteID,
					fields: serialised.fields
				}
			}
		})
	});

	// Parse the response:
	const response = await request.json();

	// Check if the response is an error:
	if (response?.error) {
		throw new Error(response.error);
	}

	return true;
}
