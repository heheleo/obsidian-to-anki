import type { Note } from 'src/parser';
import { DEFAULT_SETTINGS, type PluginSettings } from 'src/settings/defaults';

/**
 * Find a note in AnkiConnect.
 * @param settings the settings object for the plugin
 * @param noteToFind the note to find
 * @returns {Promise<number[]>} the IDs of the notes that were found
 */
export async function ankiConnectFindNotes(
	settings: PluginSettings,
	noteToFind: Note
) {
	// Get the port from the settings, or use the default port:
	const port = settings?.ankiConnectPort || DEFAULT_SETTINGS.ankiConnectPort;
	// Construct the request URL:
	const requestURL = `http://localhost:${port}`;

	let query = '';
	if (noteToFind.type === 'Cloze') {
		query = `"deck:${noteToFind.deck}" "text:${noteToFind.text}"`;
	} else if (noteToFind.type === 'Basic') {
		query = `"deck:${noteToFind.deck}" "front:${noteToFind.front}"`;
	}

	const request = await fetch(requestURL, {
		method: 'POST',
		body: JSON.stringify({
			action: 'findNotes',
			version: 6,
			params: { query }
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

	return response.result as number[];
}
