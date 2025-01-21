import { stripIndents } from 'common-tags';

/**
 * Surrounds the given text in placeholders, with indents stripped.
 * @param text the text to surround in placeholders
 * @returns surrounded text with placeholders, with indents stripped
 */
export function surroundInPlaceholders(text: string): string {
	return stripIndents`
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
		Maecenas a volutpat tortor, dignissim eleifend neque. 
		${text}
		Interdum et malesuada fames ac ante ipsum primis in faucibus. 
		Duis porttitor fermentum molestie. Phasellus dictum nisi sit amet dui facilisis gravida. 
	`;
}
