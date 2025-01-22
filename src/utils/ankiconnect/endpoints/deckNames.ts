import { DEFAULT_SETTINGS, type PluginSettings } from 'src/settings/defaults';

/**
 * Retrieves the names of all decks in Anki using AnkiConnect.
 *
 * @param settings - The plugin settings containing the AnkiConnect port.
 * @returns An array of deck names.
 * @throws If there is an error retrieving the deck names.
 */
export async function ankiConnectGetDeckNames(settings: PluginSettings) {
	// Get the port from the settings, or use the default port:
	const port = settings?.ankiConnectPort || DEFAULT_SETTINGS.ankiConnectPort;
	// Construct the request URL:
	const requestURL = `http://localhost:${port}`;

	const request = await fetch(requestURL, {
		method: 'POST',
		body: JSON.stringify({
			action: 'deckNames',
			version: 6
		})
	});

	// Parse the response:
	const response = await request.json();

	// Check if the response is an error:
	if (
		response?.error ||
		response?.result === null ||
		!Array.isArray(response.result)
	) {
		throw new Error(response.error);
	}

	return response.result as string[];
}
