import type { Note } from 'src/parser';

/**
 * Serialises a note object into a string that can be sent to the AnkiConnect API
 * @param note the note to serialise
 * @returns A note object compatible with the AnkiConnect API
 */
export function serialiseNote(note: Note) {
	const apiNote: any = {
		deckName: note.deck,
		modelName: note.type,
		options: {
			allowDuplicate: false,
			duplicateScope: 'deck'
		},
		tags: ['Obsidian']
	};

	if (note.type === 'Cloze') {
		Object.assign(apiNote, {
			fields: {
				Text: note.text,
				'Back Extra': note.back
			}
		});
	} else if (note.type === 'Basic') {
		Object.assign(apiNote, {
			fields: {
				Front: note.front,
				Back: note.back
			}
		});
	}

	return apiNote;
}
