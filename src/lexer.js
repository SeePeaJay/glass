"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const patterns_1 = require("./patterns");
const markup_tokens_1 = require("./markup_tokens");
class Lexer {
    constructor() {
        this.userInput = '';
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
    }
    processUserInput(input) {
        this.userInput = input;
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
        this.splitUserInputIntoBlocksAndTriggers(this.userInput);
        this.removeUnnecessaryTabsFromBlocksAndTriggers();
        // process tabs in blocksandtriggers here
    }
    splitUserInputIntoBlocksAndTriggers(input) {
        const split = input.split(patterns_1.TRIGGER_PATTERN); // split any instances of new (indented) block trigger
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
            }
            else {
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
            return this.tokenQueue.shift();
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
            const blockMarkupsPattern = new RegExp(`${patterns_1.HEADING_1_MARKUP_PATTERN.source}|${patterns_1.HEADING_2_MARKUP_PATTERN.source}|${patterns_1.HEADING_3_MARKUP_PATTERN.source}|${patterns_1.UNORDERED_LIST_MARKUP_PATTERN.source}|${patterns_1.ORDERED_LIST_MARKUP_PATTERN.source}|${patterns_1.HORIZONTAL_RULE_MARKUP_PATTERN.source}`);
            const blockMarkupMatch = this.blocksAndTriggers[this.cursor[0]].match(blockMarkupsPattern);
            if (blockMarkupMatch) {
                return this.getTokenFromBlockMarkup(blockMarkupMatch[0]);
            }
        }
        // images/hybrid
        const imageMarkupMatch = this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]).match(patterns_1.IMAGE_PATTERN);
        if (imageMarkupMatch) {
            return this.getTokenFromImageMarkup(imageMarkupMatch[0]);
        }
        // remaining text
        const remainingText = this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]);
        const remainingTokensInCurrentBlock = this.getTokensFromRemainingText(remainingText);
        const token = remainingTokensInCurrentBlock.shift();
        this.tokenQueue.push(...remainingTokensInCurrentBlock);
        return token;
    }
    getTokenFromBlockTrigger() {
        let token;
        if (this.blocksAndTriggers[this.cursor[0]].includes('\t')) {
            token = {
                name: 'NEW INDENTED BLOCK TRIGGER',
                value: this.blocksAndTriggers[this.cursor[0]],
            };
        }
        else {
            token = {
                name: 'NEW BLOCK TRIGGER',
                value: this.blocksAndTriggers[this.cursor[0]],
            };
        }
        this.adjustCursor(true, 0);
        return token;
    }
    getTokenFromBlockMarkup(blockMarkup) {
        let token;
        if (blockMarkup === markup_tokens_1.HEADING_1_MARKUP_TOKEN.value) {
            token = markup_tokens_1.HEADING_1_MARKUP_TOKEN;
        }
        else if (blockMarkup === markup_tokens_1.HEADING_2_MARKUP_TOKEN.value) {
            token = markup_tokens_1.HEADING_2_MARKUP_TOKEN;
        }
        else if (blockMarkup === markup_tokens_1.HEADING_3_MARKUP_TOKEN.value) {
            token = markup_tokens_1.HEADING_3_MARKUP_TOKEN;
        }
        else if (blockMarkup === '* ') {
            token = markup_tokens_1.UNORDERED_LIST_MARKUP_TOKEN;
        }
        else if (blockMarkup.match(/\d+. /)) {
            token = {
                name: 'ORDERED LIST MARKUP',
                value: blockMarkup,
            };
        }
        else {
            token = markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN;
        }
        this.adjustCursor(false, blockMarkup.length);
        return token;
    }
    getTokenFromImageMarkup(imageMarkup) {
        const lexemes = imageMarkup.split(/(?<=image:)|(?={})/g);
        const token = markup_tokens_1.IMAGE_MARKUP_1_TOKEN;
        const remainingTokens = [
            ...this.getTokensFromRemainingText(lexemes[1]),
            markup_tokens_1.IMAGE_MARKUP_2_TOKEN,
        ];
        this.tokenQueue.push(...remainingTokens);
        this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
        return token;
    }
    getTokensFromRemainingText(remainingText) {
        let lexemes;
        let tokens = [];
        // let matchedString = '';
        const inlinePattern = new RegExp(`${patterns_1.BOLD_TEXT_PATTERN.source}|${patterns_1.ITALIC_TEXT_PATTERN.source}|${patterns_1.UNDERLINED_TEXT_PATTERN.source}|${patterns_1.HIGHLIGHTED_TEXT_PATTERN.source}|${patterns_1.STRIKETHROUGH_TEXT_PATTERN.source}|${patterns_1.LINK_PATTERN.source}`);
        const inlineMatch = remainingText.match(inlinePattern);
        if (!inlineMatch) {
            if (remainingText.length === 1) {
                tokens = [
                    {
                        name: 'NON-CONTROL CHARACTER',
                        value: remainingText,
                    },
                ];
            }
            else {
                tokens = [
                    {
                        name: 'NON-CONTROL CHARACTERS',
                        value: remainingText,
                    },
                ];
            }
            this.adjustCursor(false, remainingText.length);
        }
        else {
            const inline = inlineMatch[0];
            const nonControls = remainingText.split(inline);
            if (nonControls[0].length) {
                if (nonControls[0].length === 1) {
                    tokens.push({
                        name: 'NON-CONTROL CHARACTER',
                        value: nonControls[0],
                    });
                }
                else {
                    tokens.push({
                        name: 'NON-CONTROL CHARACTERS',
                        value: nonControls[0],
                    });
                }
                this.adjustCursor(false, nonControls[0].length);
            }
            // const inline = texts[1];
            if (inline.startsWith(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value)) {
                lexemes = inline.split(/(?<=`@)|(?=@`)/g);
                tokens.push(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(lexemes[1]), markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN);
                this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
            }
            if (nonControls[1].length) {
                if (nonControls[1].length === 1) {
                    tokens.push({
                        name: 'NON-CONTROL CHARACTER',
                        value: nonControls[1],
                    });
                }
                else {
                    tokens.push({
                        name: 'NON-CONTROL CHARACTERS',
                        value: nonControls[1],
                    });
                }
                this.adjustCursor(false, nonControls[1].length);
            }
        }
        // if (remainingText.match(/^`@.+@`/)) {
        // 	[matchedString] = remainingText.match(/^`@.+@`/)!;
        // 	lexemes = matchedString.split(/(?<=`@)|(?=@`)/g);
        // 	tokens = [
        // 		LEFT_BOLD_TEXT_MARKUP_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[1]),
        // 		RIGHT_BOLD_TEXT_MARKUP_TOKEN,
        // 	];
        // 	this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
        // } else if (remainingText.match(/^`\/.+\/`/)) {
        // 	[matchedString] = remainingText.match(/^`\/.+\/`/)!;
        // 	lexemes = remainingText.match(/^`\/.+\/`/)![0].split(/(?<=`\/)|(?=\/`)/g);
        // 	tokens = [
        // 		LEFT_ITALIC_TEXT_MARKUP_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[1]),
        // 		RIGHT_ITALIC_TEXT_MARKUP_TOKEN,
        // 	];
        // 	this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
        // } else if (remainingText.match(/^`_.+_`/)) {
        // 	[matchedString] = remainingText.match(/^`_.+_`/)!;
        // 	lexemes = remainingText.match(/^`_.+_`/)![0].split(/(?<=`_)|(?=_`)/g);
        // 	tokens = [
        // 		LEFT_UNDERLINED_TEXT_MARKUP_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[1]),
        // 		RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN,
        // 	];
        // 	this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
        // } else if (remainingText.match(/^`=.+=`/)) {
        // 	[matchedString] = remainingText.match(/^`=.+=`/)!;
        // 	lexemes = remainingText.match(/^`=.+=`/)![0].split(/(?<=`=)|(?==`)/g);
        // 	tokens = [
        // 		LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[1]),
        // 		RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN,
        // 	];
        // 	this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
        // } else if (remainingText.match(/^`-.+-`/)) {
        // 	[matchedString] = remainingText.match(/^`-.+-`/)!;
        // 	lexemes = remainingText.match(/^`-.+-`/)![0].split(/(?<=`-)|(?=-`)/g);
        // 	tokens = [
        // 		LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[1]),
        // 		RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN,
        // 	];
        // 	this.adjustCursor(false, lexemes[0].length + lexemes[2].length);
        // } else if (remainingText.match(/^`_.+_\(.+\)`/)) {
        // 	[matchedString] = remainingText.match(/^`_.+_\(.+\)`/)!;
        // 	const firstSplit = matchedString.split(/_(\()/g);
        // 	const secondSplit = firstSplit[0].split(/(?<=`_)/g);
        // 	const thirdSplit = firstSplit[2].split(/(?=\)`)/g);
        // 	lexemes = [...secondSplit, '_(', ...thirdSplit];
        // 	tokens = [
        // 		LINK_TEXT_MARKUP_1_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[1]),
        // 		LINK_TEXT_MARKUP_2_TOKEN,
        // 		...this.getTokensFromRemainingText(lexemes[3]),
        // 		LINK_TEXT_MARKUP_3_TOKEN,
        // 	];
        // 	this.adjustCursor(false, lexemes[0].length + lexemes[2].length + lexemes[4].length);
        // } else if (remainingText.length === 1) {
        // 	tokens = [
        // 		{
        // 			name: 'NON-CONTROL CHARACTER',
        // 			value: remainingText,
        // 		},
        // 	];
        // 	this.adjustCursor(false, remainingText.length);
        // } else {
        // 	tokens = [
        // 		{
        // 			name: 'NON-CONTROL CHARACTERS',
        // 			value: remainingText,
        // 		},
        // 	];
        // 	this.adjustCursor(false, remainingText.length);
        // }
        return tokens;
    }
    adjustCursor(shouldIncrement, offset) {
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
exports.default = Lexer;
