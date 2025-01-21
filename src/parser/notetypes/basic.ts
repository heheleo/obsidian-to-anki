import type { PluginSettings } from 'src/settings/defaults';
import type { Note, ParserError } from '..';

export function parseBasicChunk(
	lines: string[],
	settings: PluginSettings,
	deck: string
): { note: Note; errors: ParserError[] } {
	const errors: ParserError[] = [];

	let front = '';
	let back = '';
	let isParsing: 'front' | 'back' | null = null;

	for (var i = 0; i < lines.length; ++i) {
		const line = lines[i];

		// Check if the line is a note type, or deck type line:
		if (
			line.startsWith(settings.noteTypeBeginning) ||
			line.startsWith(settings.deckBeginning)
		) {
			continue;
		}

		// This is an inline front comment.
		// e.g. "Front: What is 2x2?"
		if (
			line.startsWith(settings.noteFrontBeginning) &&
			line.trim().length !== settings.noteFrontBeginning.trim().length
		) {
			if (front !== '') {
				// The user has already defined the front of the card.
				// Warn the user that the front of the card is being overwritten.
				errors.push({
					type: 'warning',
					message:
						'The front of the card is being overwritten. (it has been likely defined twice)'
				});
			}

			front = line.substring(settings.noteFrontBeginning.length);
			continue;
		}

		// This is a multiline front comment.
		// e.g. "Front:"
		// 	"What is 2x2?"
		if (line === settings.noteFrontBeginning) {
			front = '';
			isParsing = 'front';
			continue;
		}

		// This is an inline back comment.
		if (
			line.startsWith(settings.noteBackBeginning) &&
			line.trim().length !== settings.noteBackBeginning.trim().length
		) {
			if (back !== '') {
				errors.push({
					type: 'warning',
					message:
						'The back of the card is being overwritten. (it has been likely defined twice)'
				});
			}

			back = line.substring(settings.noteBackBeginning.length);
			continue;
		}

		// This is a multiline back comment.
		if (line === settings.noteBackBeginning) {
			back = '';
			isParsing = 'back';
			continue;
		}

		// Append the line to the front or back of the card.
		if (isParsing === 'front') {
			front += line + '\n';
		} else if (isParsing === 'back') {
			back += line + '\n';
		}
	}

	// Trim the front and back of the card:
	front = front.trim();
	back = back.trim();

	// Check if the front of the card is empty:
	if (front === '') {
		errors.push({
			type: 'error',
			fatal: true,
			message: 'The front of the card is missing.'
		});
	}

	// Check if the back of the card is empty:
	if (back === '') {
		errors.push({
			type: 'error',
			fatal: true,
			message: 'The back of the card is missing.'
		});
	}

	const note: Note = {
		front,
		back,
		type: 'Basic',
		deck
	};

	return { note, errors };
}
