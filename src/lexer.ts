import { Token } from './types';
import {
	TRIGGER_PATTERN, HEADING_1_MARKUP_PATTERN, HEADING_2_MARKUP_PATTERN, HEADING_3_MARKUP_PATTERN, UNORDERED_LIST_MARKUP_PATTERN, ORDERED_LIST_MARKUP_PATTERN, HORIZONTAL_RULE_MARKUP_PATTERN, IMAGE_MARKUP_PATTERN, BOLD_TEXT_PATTERN, ITALIC_TEXT_PATTERN, UNDERLINED_TEXT_PATTERN, HIGHLIGHTED_TEXT_PATTERN, STRIKETHROUGH_TEXT_PATTERN, LINK_PATTERN,
} from './patterns';
import {
	HEADING_1_MARKUP_TOKEN, HEADING_2_MARKUP_TOKEN, HEADING_3_MARKUP_TOKEN, UNORDERED_LIST_MARKUP_TOKEN, HORIZONTAL_RULE_MARKUP_TOKEN, IMAGE_MARKUP_1_TOKEN, IMAGE_MARKUP_2_TOKEN, LEFT_BOLD_TEXT_MARKUP_TOKEN, RIGHT_BOLD_TEXT_MARKUP_TOKEN, LEFT_ITALIC_TEXT_MARKUP_TOKEN, RIGHT_ITALIC_TEXT_MARKUP_TOKEN, LEFT_UNDERLINED_TEXT_MARKUP_TOKEN, RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN, LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN, RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN, LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN, RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN, LINK_MARKUP_1_TOKEN, LINK_MARKUP_2_TOKEN, LINK_MARKUP_3_TOKEN,
} from './markup_tokens';

class Lexer {
	userInput: string;
	blocksAndTriggers: string[];
    cursor: number[];
    tokenQueue: Token[];

    constructor() {
		this.userInput = '';
		this.blocksAndTriggers = [];
        this.cursor = [0, 0];
		this.tokenQueue = [];
    }

    processUserInput(input: string) {
		this.userInput = input;
		this.blocksAndTriggers = [];
		this.cursor = [0, 0];
		this.tokenQueue = [];

		this.splitUserInputIntoBlocksAndTriggers(this.userInput);
		this.removeUnnecessaryTabsFromBlocksAndTriggers();
		// process tabs in blocksandtriggers here
    }

    splitUserInputIntoBlocksAndTriggers(input: string) {
		const split = input.split(TRIGGER_PATTERN); // split any instances of new (indented) block trigger
		this.blocksAndTriggers.push(...split);
	}

	removeUnnecessaryTabsFromBlocksAndTriggers() {
		let maxIndentLevel = 1;
		for (let i = 1; i < this.blocksAndTriggers.length; i += 2) {
			if (this.blocksAndTriggers[i].includes('\t')) {
				const split = this.blocksAndTriggers[i].split(/(\n)(?!\n)/g);
				const tabCharacters = split[2];
				if (tabCharacters.length > maxIndentLevel) {
					const array = [split[0], split[1], '\t'.repeat(maxIndentLevel)];
					this.blocksAndTriggers[i] = array.join('');
				}
			} else {
				maxIndentLevel = 1;
			}
		}

		for (let j = 0; j < this.blocksAndTriggers.length; j += 2) {
			this.blocksAndTriggers[j] = this.blocksAndTriggers[j].replace(/\t+/g, '');
		}
	}

    isEoF() {
        return this.cursor[0] === this.blocksAndTriggers.length;
    }

    getNextToken() {
		if (this.tokenQueue.length) {
			return this.tokenQueue.shift()!;
		}

		if ((this.blocksAndTriggers.length === 1 && this.blocksAndTriggers[0] === '') || this.isEoF()) {
			return null;
		}

		return this.getTokenFromEngram();
    }

    getTokenFromEngram() {
		// block triggers
		if (this.cursor[0] % 2) {
			return this.getTokenFromBlockTrigger();
		}

		// block markups
		if (this.cursor[1] === 0) {
			const blockMarkupsPattern = new RegExp(
				`${HEADING_1_MARKUP_PATTERN.source}|${HEADING_2_MARKUP_PATTERN.source}|${HEADING_3_MARKUP_PATTERN.source}|${UNORDERED_LIST_MARKUP_PATTERN.source}|${ORDERED_LIST_MARKUP_PATTERN.source}|${HORIZONTAL_RULE_MARKUP_PATTERN.source}|^${IMAGE_MARKUP_PATTERN.source}$`,
			);
			const blockMarkupMatch = this.blocksAndTriggers[this.cursor[0]].match(blockMarkupsPattern);
			if (blockMarkupMatch) {
				return this.getTokenFromBlockMarkup(blockMarkupMatch[0]);
			}
		}

		// remaining text
		const remainingText = this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]);
		const remainingTokensInCurrentBlock = this.getTokensFromRemainingText(remainingText);
		const token = remainingTokensInCurrentBlock.shift()!;
		this.tokenQueue.push(...remainingTokensInCurrentBlock);
		return token;
	}

	getTokenFromBlockTrigger() {
		let token: Token;

		if (this.blocksAndTriggers[this.cursor[0]].includes('\t')) {
			token = {
				name: 'NEW INDENTED BLOCK TRIGGER',
				value: this.blocksAndTriggers[this.cursor[0]],
			};
		} else {
			token = {
				name: 'NEW BLOCK TRIGGER',
				value: this.blocksAndTriggers[this.cursor[0]],
			};
		}

		this.adjustCursor(true, 0);

		return token;
	}

	getTokenFromBlockMarkup(blockMarkup: string) {
		let token: Token;

		if (blockMarkup === HEADING_1_MARKUP_TOKEN.value) {
			token = HEADING_1_MARKUP_TOKEN;
		} else if (blockMarkup === HEADING_2_MARKUP_TOKEN.value) {
			token = HEADING_2_MARKUP_TOKEN;
		} else if (blockMarkup === HEADING_3_MARKUP_TOKEN.value) {
			token = HEADING_3_MARKUP_TOKEN;
		} else if (blockMarkup === UNORDERED_LIST_MARKUP_TOKEN.value) {
			token = UNORDERED_LIST_MARKUP_TOKEN;
		} else if (blockMarkup.match(ORDERED_LIST_MARKUP_PATTERN)) {
			token = {
				name: 'ORDERED LIST MARKUP',
				value: blockMarkup,
			};
		} else if (blockMarkup === HORIZONTAL_RULE_MARKUP_TOKEN.value) {
			token = HORIZONTAL_RULE_MARKUP_TOKEN;
		} else {
			const imageTokens = this.getTokensFromImageMarkup(blockMarkup);
			token = imageTokens.shift()!;
			this.tokenQueue.push(...imageTokens);
		}

		if (!blockMarkup.match(IMAGE_MARKUP_PATTERN)) {
			this.adjustCursor(false, blockMarkup.length);
		}
		return token;
	}

	getTokensFromImageMarkup(imageMarkup: string) {
		const splitImageMarkupPattern = new RegExp(`(?<=${IMAGE_MARKUP_1_TOKEN.value})|(?=${IMAGE_MARKUP_2_TOKEN.value})`);
		const imageChunks = imageMarkup.split(splitImageMarkupPattern);
		const tokens = [
			IMAGE_MARKUP_1_TOKEN,
			...this.getTokensFromRemainingText(imageChunks[1]),
			IMAGE_MARKUP_2_TOKEN,
		];
		this.adjustCursor(false, IMAGE_MARKUP_1_TOKEN.value.length + IMAGE_MARKUP_2_TOKEN.value.length);
		return tokens;
	}

    getTokensFromRemainingText(remainingText: string): Token[] {
		let tokens: Token[] = [];

		const inlinePattern = new RegExp(
				`${IMAGE_MARKUP_PATTERN.source}|${BOLD_TEXT_PATTERN.source}|${ITALIC_TEXT_PATTERN.source}|${UNDERLINED_TEXT_PATTERN.source}|${HIGHLIGHTED_TEXT_PATTERN.source}|${STRIKETHROUGH_TEXT_PATTERN.source}|${LINK_PATTERN.source}`, // and image?
		);

		const inlineMatch = remainingText.match(inlinePattern);

		if (!inlineMatch) {
			if (remainingText.length === 1) {
				tokens = [
					{
						name: 'NON-CONTROL CHARACTER',
						value: remainingText,
					},
				];
			} else {
				tokens = [
					{
						name: 'NON-CONTROL CHARACTERS',
						value: remainingText,
					},
				];
			}
			this.adjustCursor(false, remainingText.length);
		} else {
			const inline = inlineMatch[0];
			const unmatchedTexts = remainingText.split(inline);

			if (unmatchedTexts[0].length) {
				if (unmatchedTexts[0].length === 1) {
					tokens.push(
						{
							name: 'NON-CONTROL CHARACTER',
							value: unmatchedTexts[0],
						},
					);
				} else {
					tokens.push(
						{
							name: 'NON-CONTROL CHARACTERS',
							value: unmatchedTexts[0],
						},
					);
				}
				this.adjustCursor(false, unmatchedTexts[0].length);
			}

			if (inline.startsWith(IMAGE_MARKUP_1_TOKEN.value)) {
				tokens.push(...this.getTokensFromImageMarkup(inline));
			} else if (inline.startsWith(LEFT_BOLD_TEXT_MARKUP_TOKEN.value)) {
				const splitBoldTextPattern = new RegExp(`(?<=${LEFT_BOLD_TEXT_MARKUP_TOKEN.value})|(?=${RIGHT_BOLD_TEXT_MARKUP_TOKEN.value})`);
				const boldTextChunks = inline.split(splitBoldTextPattern);
				tokens.push(
					LEFT_BOLD_TEXT_MARKUP_TOKEN,
					...this.getTokensFromRemainingText(boldTextChunks[1]),
					RIGHT_BOLD_TEXT_MARKUP_TOKEN,
				);
				this.adjustCursor(false, boldTextChunks[0].length + boldTextChunks[2].length);
			} else if (inline.startsWith(LEFT_ITALIC_TEXT_MARKUP_TOKEN.value)) {
				const splitItalicTextPattern = new RegExp(`(?<=${LEFT_ITALIC_TEXT_MARKUP_TOKEN.value})|(?=${RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value})`);
				const italicTextChunks = inline.split(splitItalicTextPattern);
				tokens.push(
					LEFT_ITALIC_TEXT_MARKUP_TOKEN,
					...this.getTokensFromRemainingText(italicTextChunks[1]),
					RIGHT_ITALIC_TEXT_MARKUP_TOKEN,
				);
				this.adjustCursor(false, italicTextChunks[0].length + italicTextChunks[2].length);
			} else if (inline.startsWith(LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value) && inline.endsWith(RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value)) {
				const splitUnderlinedTextPattern = new RegExp(`(?<=${LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value})|(?=${RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value})`);
				const underlinedTextChunks = inline.split(splitUnderlinedTextPattern);
				tokens.push(
					LEFT_UNDERLINED_TEXT_MARKUP_TOKEN,
					...this.getTokensFromRemainingText(underlinedTextChunks[1]),
					RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN,
				);
				this.adjustCursor(false, underlinedTextChunks[0].length + underlinedTextChunks[2].length);
			} else if (inline.startsWith(LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value)) {
				const splitHighlightedTextPattern = new RegExp(`(?<=${LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value})|(?=${RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value})`);
				const highlightedTextChunks = inline.split(splitHighlightedTextPattern);
				tokens.push(
					LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN,
					...this.getTokensFromRemainingText(highlightedTextChunks[1]),
					RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN,
				);
				this.adjustCursor(false, highlightedTextChunks[0].length + highlightedTextChunks[2].length);
			} else if (inline.startsWith(LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value)) {
				const splitStrikethroughTextPattern = new RegExp(`(?<=${LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value})|(?=${RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value})`);
				const strikethroughTextChunks = inline.split(splitStrikethroughTextPattern);
				tokens.push(
					LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN,
					...this.getTokensFromRemainingText(strikethroughTextChunks[1]),
					RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN,
				);
				this.adjustCursor(false, strikethroughTextChunks[0].length + strikethroughTextChunks[2].length);
			} else if (inline.startsWith(LINK_MARKUP_1_TOKEN.value) && inline.endsWith(LINK_MARKUP_3_TOKEN.value)) {
				const firstLinkSplit = inline.split(LINK_MARKUP_2_TOKEN.value);
				const secondLinkSplit = firstLinkSplit[0].split(LINK_MARKUP_1_TOKEN.value);
				const thirdLinkSplit = firstLinkSplit[1].split(LINK_MARKUP_3_TOKEN.value);
				const linkChunks = [
					LINK_MARKUP_1_TOKEN.value,
					secondLinkSplit[1],
					LINK_MARKUP_2_TOKEN.value,
					thirdLinkSplit[0],
					LINK_MARKUP_3_TOKEN.value,
				];
				tokens = [
					LINK_MARKUP_1_TOKEN,
					...this.getTokensFromRemainingText(linkChunks[1]),
					LINK_MARKUP_2_TOKEN,
					...this.getTokensFromRemainingText(linkChunks[3]),
					LINK_MARKUP_3_TOKEN,
				];
				this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[4].length);
			}

			if (unmatchedTexts[1].length) {
				tokens.push(...this.getTokensFromRemainingText(unmatchedTexts[1]));
			}
		}

		return tokens;
	}

	adjustCursor(shouldIncrement: boolean, offset: number) {
		if (shouldIncrement) {
			this.cursor[0]++;
			this.cursor[1] = 0;
		}
		this.cursor[1] += offset;
		if (this.cursor[1] === this.blocksAndTriggers[this.cursor[0]].length) {
			this.cursor[0]++;
			this.cursor[1] = 0;
		}
	}
}

export default Lexer;
