import { ankiConnectAddNote } from './endpoints/addNote';
import { ankiConnectAddNotes } from './endpoints/addNotes';
import { ankiConnectCanAddNotesWithErrorDetail } from './endpoints/canAddNotesWithErrorDetail';
import { ankiConnectGetDeckNames } from './endpoints/deckNames';
import { ankiConnectFindNotes } from './endpoints/findNotes';
import { ankiConnectUpdateNote } from './endpoints/updateNote';

/**
 * A namespace for the AnkiConnect API.
 */
export const AnkiConnectAPI = {
	getDecknames: ankiConnectGetDeckNames,
	addNote: ankiConnectAddNote,
	addNotes: ankiConnectAddNotes,
	canAddNotesWithErrorDetail: ankiConnectCanAddNotesWithErrorDetail,
	findNotes: ankiConnectFindNotes,
	updateNote: ankiConnectUpdateNote
};
