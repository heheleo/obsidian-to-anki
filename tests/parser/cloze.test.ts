import { extractNotes } from 'src/parser';
import { DEFAULT_SETTINGS } from 'src/settings/defaults';
import { surroundInPlaceholders } from 'tests/string';
import { describe, expect, test } from 'vitest';

describe('Cloze note type parsing', () => {
	test('Empty chunk', () => {
		const document = ``;

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(0);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
	});

	test('No cloze deletions provided', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front: The capital of France is Paris.
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);
		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(0);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(1);
		const error = errors[0];
		expect(error.type).toBe('error');
		expect(error.fatal).toBe(true);
		expect(error.message).toBe(
			'The front of the card is missing Cloze deletions.'
		);
	});

	test('Inline back provided', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front: The capital of France is {{Paris}}.
			Back: Paris is the capital of France, according to the French government.
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.front).toBe('The capital of France is {{c1::Paris}}.');
		expect(note.back).toBe(
			'Paris is the capital of France, according to the French government.'
		);
	});

	test('Multiline back provided', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front: The capital of France is {{Paris}}.
			Back:
			According to Wikipedia,
			Paris is the capital of France, according to the French government.
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.front).toBe('The capital of France is {{c1::Paris}}.');
		expect(note.back).toBe(
			'According to Wikipedia,\nParis is the capital of France, according to the French government.'
		);
	});

	test('Cloze tag parsing: no ID', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front: The capital of France is {{Paris}}. The capital of Germany is {{Berlin}}.
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.type).toBe('Cloze');
		expect(note.front).toBe(
			'The capital of France is {{c1::Paris}}. The capital of Germany is {{c2::Berlin}}.'
		);
		expect(note.back).toBeUndefined();
	});

	test('Cloze tag parsing: no ID, multiline', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front:
			The capital of France is {{Paris}}.
			The capital of Germany is {{Berlin}}.
			The capital of Italy is {{Rome}}.
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.type).toBe('Cloze');
		expect(note.front).toBe(
			'The capital of France is {{c1::Paris}}.\nThe capital of Germany is {{c2::Berlin}}.\nThe capital of Italy is {{c3::Rome}}.'
		);
		expect(note.back).toBeUndefined();
	});

	test('Cloze tag parsing: IDs provided', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front: The capital of France is {{1|Paris}}. The capital of Germany is {{1|Berlin}}.
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.type).toBe('Cloze');
		expect(note.front).toBe(
			'The capital of France is {{c1::Paris}}. The capital of Germany is {{c1::Berlin}}.'
		);
		expect(note.back).toBeUndefined();
	});

	test('Cloze tag parsing: IDs provided, multiline', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Card Type: Cloze
			Deck: Common Knowledge
			Front:
			The capital of Germany is {{2|Berlin}}.
			(Hint: {{2|Berlin}} has amazing food.)
			Anki End
		`);

		const { notes, errors } = extractNotes(document, DEFAULT_SETTINGS);

		expect(notes).toBeInstanceOf(Array);
		expect(notes).toHaveLength(1);
		expect(errors).toBeInstanceOf(Array);
		expect(errors).toHaveLength(0);
		const note = notes[0];
		expect(note.type).toBe('Cloze');
		expect(note.front).toBe(
			'The capital of Germany is {{c2::Berlin}}.\n(Hint: {{c2::Berlin}} has amazing food.)'
		);
		expect(note.back).toBeUndefined();
	});

	test('Deck parsing', () => {
		const document = surroundInPlaceholders(`
			## Anki
			Deck: Common Knowledge
			Card Type: Cloze
			Front: The capital of France is {{Paris}}.
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
});
