import { extractNotes } from 'src/parser';
import { DEFAULT_SETTINGS } from 'src/settings/defaults';
import { surroundInPlaceholders } from 'tests/string';
import { describe, expect, test } from 'vitest';

describe('Card type parsing', () => {
	test('Empty chunk', () => {
		const document = ``;

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(0);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
	});

	test('Basic card type', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Deck: Common Knowledge
			Card Type: Basic
			Front: Front
			Back: Back
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.type).toBe('Basic');
	});

	test('Cloze card type', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Deck: Common Knowledge
			Card Type: Cloze
			Front: {{Front}}
			Back: Back
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.type).toBe('Cloze');
	});

	test('Invalid card type', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Deck: Common Knowledge
			Card Type: Basix
			Front: Front
			Back: Back
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(1);
		const error = errors[0];
		expect(error.type).toBe('error');
		// Not a fatal error as the type should default to Basic:
		expect(error.fatal).toBe(false);
		expect(notes[0].type).toBe('Basic');
	});

	test('No card type provided', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Deck: Common Knowledge
			Front: Front
			Back: Back
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		// The type should default to Basic:
		expect(notes[0].type).toBe('Basic');
	});
});
