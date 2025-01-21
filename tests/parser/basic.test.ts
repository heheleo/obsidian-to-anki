import { extractNotes } from 'src/parser';
import { DEFAULT_SETTINGS } from 'src/settings/defaults';
import { surroundInPlaceholders } from 'tests/string';
import { describe, expect, test } from 'vitest';

describe('Basic note type parsing', () => {
	test('Empty chunk', () => {
		const document = ``;

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(0);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
	});

	test('Inline front, inline back notes', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Basic
			Deck: Common Knowledge
			Front: What is the capital of France?
			Back: Paris
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.front).toBe('What is the capital of France?');
		expect(note.back).toBe('Paris');
	});

	test('Multiline front, back notes', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Deck: Common Knowledge
			Front:
			What is the capital of France?
			(Hint: It starts with a P)
			Back:
			Paris!
			If you didn't know, now you know.
			Card Type: Basic
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.front).toBe(
			'What is the capital of France?\n(Hint: It starts with a P)'
		);
		expect(note.back).toBe("Paris!\nIf you didn't know, now you know.");
	});

	test('Deck parsing: inline front and back', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Back: Back
			Front: Front
			Deck: Common Knowledge
			Card Type: Basic
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.deck).toBe('Common Knowledge');
	});

	test('Deck parsing: multiline front and back', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Front:
			Deck: Common Knowledge
			What is the capital of France?
			(Hint: It starts with a P)
			Back:
			Paris!
			If you didn't know, now you know.
			Card Type: Basic
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.deck).toBe('Common Knowledge');
		expect(note.front).toBe(
			'What is the capital of France?\n(Hint: It starts with a P)'
		);
		expect(note.back).toBe("Paris!\nIf you didn't know, now you know.");
	});
});
