import { Token } from './types';
import { TOKENS, TOKEN_TYPE, PATTERNS } from './constants';

class Lexer {
	blocksAndTriggers: string[];
    cursor: number[];
    tokenQueue: Token[];
	ignoredPatterns: Map<string, number>;

    constructor() {
		this.blocksAndTriggers = [];
        this.cursor = [0, 0];
		this.tokenQueue = [];
		this.ignoredPatterns = new Map();
    }

    processBlocksAndTriggers(blocksAndTriggers: string[]) {
		this.blocksAndTriggers = blocksAndTriggers;
		this.cursor = [0, 0];
		this.tokenQueue = [];
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
		if (this.blocksAndTriggers[this.cursor[0]] === '') {
			this.adjustCursor(true, 0);
			return TOKENS.BLANK_LINE;
		}

		// block triggers
		if (this.cursor[0] % 2) {
			return this.getTokenFromBlockTrigger();
		}

		// block markups
		if (this.cursor[1] === 0) {
			const blockMarkupsPattern = new RegExp(
				`${PATTERNS.HEADING_1_MARKUP.source}|${PATTERNS.HEADING_2_MARKUP.source}|${PATTERNS.HEADING_3_MARKUP.source}|${PATTERNS.UNORDERED_LIST_MARKUP.source}|${PATTERNS.ORDERED_LIST_MARKUP.source}|${PATTERNS.HORIZONTAL_RULE_MARKUP.source}|^${PATTERNS.IMAGE.source}$`,
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
				name: TOKEN_TYPE.NEW_INDENTED_BLOCK_TRIGGER,
				value: this.blocksAndTriggers[this.cursor[0]],
			};
		} else {
			token = {
				name: TOKEN_TYPE.NEW_BLOCK_TRIGGER,
				value: this.blocksAndTriggers[this.cursor[0]],
			};
		}

		this.adjustCursor(true, 0);

		return token;
	}

	getTokenFromBlockMarkup(blockMarkup: string) {
		let token: Token;

		if (blockMarkup === TOKENS.HEADING_1_MARKUP.value) {
			token = TOKENS.HEADING_1_MARKUP;
		} else if (blockMarkup === TOKENS.HEADING_2_MARKUP.value) {
			token = TOKENS.HEADING_2_MARKUP;
		} else if (blockMarkup === TOKENS.HEADING_3_MARKUP.value) {
			token = TOKENS.HEADING_3_MARKUP;
		} else if (blockMarkup === TOKENS.UNORDERED_LIST_MARKUP.value) {
			token = TOKENS.UNORDERED_LIST_MARKUP;
		} else if (blockMarkup.match(PATTERNS.ORDERED_LIST_MARKUP)) {
			token = {
				name: TOKEN_TYPE.ORDERED_LIST_MARKUP,
				value: blockMarkup,
			};
		} else if (blockMarkup === TOKENS.HORIZONTAL_RULE_MARKUP.value) {
			token = TOKENS.HORIZONTAL_RULE_MARKUP;
		} else {
			const imageTokens = this.getTokensFromImageMarkup(blockMarkup);
			token = imageTokens.shift()!;
			this.tokenQueue.push(...imageTokens);
		}

		if (!blockMarkup.match(PATTERNS.IMAGE)) {
			this.adjustCursor(false, blockMarkup.length);
		}
		return token;
	}

	getTokensFromImageMarkup(imageMarkup: string) {
		const tokens = [
			TOKENS.IMAGE_MARKUP_1,
			{
				name: TOKEN_TYPE.IMAGE_PATH,
				value: imageMarkup.substring(TOKENS.IMAGE_MARKUP_1.value.length, imageMarkup.length - TOKENS.IMAGE_MARKUP_2.value.length),
			},
			TOKENS.IMAGE_MARKUP_2,
		];
		this.adjustCursor(false, imageMarkup.length);
		return tokens;
	}

    getTokensFromRemainingText(remainingText: string): Token[] {
		let tokens: Token[] = [];

		const inlinePattern = this.getUpdatedInlinePattern();
		const matchedResult = remainingText.match(inlinePattern);

		if (!matchedResult) {
			tokens = [
				{
					name: TOKEN_TYPE.TEXT,
					value: remainingText,
				},
			];
			this.adjustCursor(false, remainingText.length);
		} else {
			const inlineElement = matchedResult[0];
			const unmatchedTexts = remainingText.split(inlineElement);

			if (unmatchedTexts[0].length) { // any preceding text
				tokens.push(
					{
						name: TOKEN_TYPE.TEXT,
						value: unmatchedTexts[0],
					},
				);
				this.adjustCursor(false, unmatchedTexts[0].length);
			}

			if (inlineElement.startsWith(TOKENS.IMAGE_MARKUP_1.value)) {
				tokens.push(...this.getTokensFromImageMarkup(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.LEFT_BOLD_TEXT_MARKUP.value)) {
				tokens.push(...this.getTokensFromBoldText(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.LEFT_ITALIC_TEXT_MARKUP.value)) {
				tokens.push(...this.getTokensFromItalicText(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.LEFT_UNDERLINED_TEXT_MARKUP.value) && inlineElement.endsWith(TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP.value)) {
				tokens.push(...this.getTokensFromUnderlinedText(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP.value)) {
				tokens.push(...this.getTokensFromHighlightedText(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP.value)) {
				tokens.push(...this.getTokensFromStrikethroughText(inlineElement));
			} else if (inlineElement.startsWith(TOKENS.LINK_MARKUP_1.value) && inlineElement.endsWith(TOKENS.LINK_MARKUP_3.value)) {
				tokens.push(...this.getTokensFromLink(inlineElement));
			}

			if (unmatchedTexts[1].length) {
				tokens.push(...this.getTokensFromRemainingText(unmatchedTexts[1]));
			}
		}

		return tokens;
	}

	getTokensFromBoldText(inlineElement: string) {
		const tokens: Token[] = [];

		this.ignoredPatterns.set(PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
		tokens.push(
			TOKENS.LEFT_BOLD_TEXT_MARKUP,
			...this.getTokensFromRemainingText(inlineElement.substring(TOKENS.LEFT_BOLD_TEXT_MARKUP.value.length, inlineElement.length - TOKENS.RIGHT_BOLD_TEXT_MARKUP.value.length)),
			TOKENS.RIGHT_BOLD_TEXT_MARKUP,
		);
		this.adjustCursor(false, TOKENS.LEFT_BOLD_TEXT_MARKUP.value.length + TOKENS.RIGHT_BOLD_TEXT_MARKUP.value.length);
		this.ignoredPatterns.delete(PATTERNS.BOLD_TEXT.source);

		return tokens;
	}

	getTokensFromItalicText(inlineElement: string) {
		const tokens: Token[] = [];

		this.ignoredPatterns.set(PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
		tokens.push(
			TOKENS.LEFT_ITALIC_TEXT_MARKUP,
			...this.getTokensFromRemainingText(inlineElement.substring(TOKENS.LEFT_ITALIC_TEXT_MARKUP.value.length, inlineElement.length - TOKENS.RIGHT_ITALIC_TEXT_MARKUP.value.length)),
			TOKENS.RIGHT_ITALIC_TEXT_MARKUP,
		);
		this.adjustCursor(false, TOKENS.LEFT_ITALIC_TEXT_MARKUP.value.length + TOKENS.RIGHT_ITALIC_TEXT_MARKUP.value.length);
		this.ignoredPatterns.delete(PATTERNS.BOLD_TEXT.source);

		return tokens;
	}

	getTokensFromUnderlinedText(inlineElement: string) {
		const tokens: Token[] = [];

		this.ignoredPatterns.set(PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
		tokens.push(
			TOKENS.LEFT_UNDERLINED_TEXT_MARKUP,
			...this.getTokensFromRemainingText(inlineElement.substring(TOKENS.LEFT_UNDERLINED_TEXT_MARKUP.value.length, inlineElement.length - TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP.value.length)),
			TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP,
		);
		this.adjustCursor(false, TOKENS.LEFT_UNDERLINED_TEXT_MARKUP.value.length + TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP.value.length);
		this.ignoredPatterns.delete(PATTERNS.BOLD_TEXT.source);

		return tokens;
	}

	getTokensFromHighlightedText(inlineElement: string) {
		const tokens: Token[] = [];

		this.ignoredPatterns.set(PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
		tokens.push(
			TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP,
			...this.getTokensFromRemainingText(inlineElement.substring(TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP.value.length, inlineElement.length - TOKENS.RIGHT_HIGHLIGHTED_TEXT_MARKUP.value.length)),
			TOKENS.RIGHT_HIGHLIGHTED_TEXT_MARKUP,
		);
		this.adjustCursor(false, TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP.value.length + TOKENS.RIGHT_HIGHLIGHTED_TEXT_MARKUP.value.length);
		this.ignoredPatterns.delete(PATTERNS.BOLD_TEXT.source);

		return tokens;
	}

	getTokensFromStrikethroughText(inlineElement: string) {
		const tokens: Token[] = [];

		this.ignoredPatterns.set(PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
		tokens.push(
			TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP,
			...this.getTokensFromRemainingText(inlineElement.substring(TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP.value.length, inlineElement.length - TOKENS.RIGHT_STRIKETHROUGH_TEXT_MARKUP.value.length)),
			TOKENS.RIGHT_STRIKETHROUGH_TEXT_MARKUP,
		);
		this.adjustCursor(false, TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP.value.length + TOKENS.RIGHT_STRIKETHROUGH_TEXT_MARKUP.value.length);
		this.ignoredPatterns.delete(PATTERNS.BOLD_TEXT.source);

		return tokens;
	}

	getTokensFromLink(inlineElement: string) {
		let tokens: Token[] = [];

		this.ignoredPatterns.set(PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
		const firstLinkSplit = inlineElement.split(TOKENS.LINK_MARKUP_2.value);
		const secondLinkSplit = firstLinkSplit[0].split(TOKENS.LINK_MARKUP_1.value);
		const thirdLinkSplit = firstLinkSplit[1].split(TOKENS.LINK_MARKUP_3.value);
		const linkChunks = [TOKENS.LINK_MARKUP_1.value, secondLinkSplit[1], TOKENS.LINK_MARKUP_2.value, thirdLinkSplit[0], TOKENS.LINK_MARKUP_3.value];
		tokens = [
			TOKENS.LINK_MARKUP_1,
			...this.getTokensFromRemainingText(linkChunks[1]),
			TOKENS.LINK_MARKUP_2,
			{
				name: TOKEN_TYPE.LINK_URL,
				value: linkChunks[3],
			},
			TOKENS.LINK_MARKUP_3,
		];
		this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[3].length + linkChunks[4].length);
		this.ignoredPatterns.delete(PATTERNS.BOLD_TEXT.source);

		return tokens;
	}

	getUpdatedInlinePattern() {
		const inlinePatterns = new Map([[PATTERNS.IMAGE.source, 0], [PATTERNS.BOLD_TEXT.source, 1], [PATTERNS.ITALIC_TEXT.source, 2], [PATTERNS.UNDERLINED_TEXT.source, 3], [PATTERNS.HIGHLIGHTED_TEXT.source, 4], [PATTERNS.STRIKETHROUGH_TEXT.source, 5], [PATTERNS.LINK.source, 6]]);

		for (const key of this.ignoredPatterns.keys()) {
			inlinePatterns.delete(key);
		}

		let isFirstIteration = true;
		let inlinePatternsRegExpString = '';
		for (const key of inlinePatterns.keys()) {
			if (isFirstIteration) {
				inlinePatternsRegExpString = `${key}`;
				isFirstIteration = false;
			} else {
				inlinePatternsRegExpString += `|${key}`;
			}
		}

		return new RegExp(
			inlinePatternsRegExpString,
		);
	}

	adjustCursor(shouldIncrement: boolean, offset: number) {
		this.cursor[1] += offset;
		if (shouldIncrement || (this.cursor[1] === this.blocksAndTriggers[this.cursor[0]].length)) {
			this.cursor[0]++;
			this.cursor[1] = 0;
		}
	}
}

export default Lexer;
