"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const patterns_1 = require("./patterns");
const markup_tokens_1 = require("./markup_tokens");
class Lexer {
    constructor() {
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
    }
    processUserInput(userInput) {
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
        this.splitUserInputIntoBlocksAndTriggers(userInput);
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
        if (this.blocksAndTriggers[this.cursor[0]] === '') {
            this.adjustCursor(true, 0);
            return markup_tokens_1.BLANK_LINE_TOKEN;
        }
        // block triggers
        if (this.cursor[0] % 2) {
            return this.getTokenFromBlockTrigger();
        }
        // block markups
        if (this.cursor[1] === 0) {
            const blockMarkupsPattern = new RegExp(`${patterns_1.HEADING_1_MARKUP_PATTERN.source}|${patterns_1.HEADING_2_MARKUP_PATTERN.source}|${patterns_1.HEADING_3_MARKUP_PATTERN.source}|${patterns_1.UNORDERED_LIST_MARKUP_PATTERN.source}|${patterns_1.ORDERED_LIST_MARKUP_PATTERN.source}|${patterns_1.HORIZONTAL_RULE_MARKUP_PATTERN.source}|^${patterns_1.IMAGE_MARKUP_PATTERN.source}$`);
            const blockMarkupMatch = this.blocksAndTriggers[this.cursor[0]].match(blockMarkupsPattern);
            if (blockMarkupMatch) {
                return this.getTokenFromBlockMarkup(blockMarkupMatch[0]);
            }
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
        else if (blockMarkup === markup_tokens_1.UNORDERED_LIST_MARKUP_TOKEN.value) {
            token = markup_tokens_1.UNORDERED_LIST_MARKUP_TOKEN;
        }
        else if (blockMarkup.match(patterns_1.ORDERED_LIST_MARKUP_PATTERN)) {
            token = {
                name: 'ORDERED LIST MARKUP',
                value: blockMarkup,
            };
        }
        else if (blockMarkup === markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN.value) {
            token = markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN;
        }
        else {
            const imageTokens = this.getTokensFromImageMarkup(blockMarkup);
            token = imageTokens.shift();
            this.tokenQueue.push(...imageTokens);
        }
        if (!blockMarkup.match(patterns_1.IMAGE_MARKUP_PATTERN)) {
            this.adjustCursor(false, blockMarkup.length);
        }
        return token;
    }
    getTokensFromImageMarkup(imageMarkup) {
        const tokens = [
            markup_tokens_1.IMAGE_MARKUP_1_TOKEN,
            ...this.getTokensFromRemainingText(imageMarkup.substring(markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value.length, imageMarkup.length - markup_tokens_1.IMAGE_MARKUP_2_TOKEN.value.length)),
            markup_tokens_1.IMAGE_MARKUP_2_TOKEN,
        ];
        this.adjustCursor(false, markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value.length + markup_tokens_1.IMAGE_MARKUP_2_TOKEN.value.length);
        return tokens;
    }
    getTokensFromRemainingText(remainingText) {
        let tokens = [];
        const inlinePattern = new RegExp(`${patterns_1.IMAGE_MARKUP_PATTERN.source}|${patterns_1.BOLD_TEXT_PATTERN.source}|${patterns_1.ITALIC_TEXT_PATTERN.source}|${patterns_1.UNDERLINED_TEXT_PATTERN.source}|${patterns_1.HIGHLIGHTED_TEXT_PATTERN.source}|${patterns_1.STRIKETHROUGH_TEXT_PATTERN.source}|${patterns_1.LINK_PATTERN.source}`);
        const inlineMatch = remainingText.match(inlinePattern);
        if (!inlineMatch) {
            tokens = [
                {
                    name: 'NON-CONTROL CHARACTERS',
                    value: remainingText,
                },
            ];
            this.adjustCursor(false, remainingText.length);
        }
        else {
            const inline = inlineMatch[0];
            const unmatchedTexts = remainingText.split(inline);
            if (unmatchedTexts[0].length) {
                tokens.push({
                    name: 'NON-CONTROL CHARACTERS',
                    value: unmatchedTexts[0],
                });
                this.adjustCursor(false, unmatchedTexts[0].length);
            }
            if (inline.startsWith(markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value)) {
                tokens.push(...this.getTokensFromImageMarkup(inline));
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN);
                this.adjustCursor(false, markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN);
                this.adjustCursor(false, markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value) && inline.endsWith(markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN);
                this.adjustCursor(false, markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN);
                this.adjustCursor(false, markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN);
                this.adjustCursor(false, markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LINK_MARKUP_1_TOKEN.value) && inline.endsWith(markup_tokens_1.LINK_MARKUP_3_TOKEN.value)) {
                const firstLinkSplit = inline.split(markup_tokens_1.LINK_MARKUP_2_TOKEN.value);
                const secondLinkSplit = firstLinkSplit[0].split(markup_tokens_1.LINK_MARKUP_1_TOKEN.value);
                const thirdLinkSplit = firstLinkSplit[1].split(markup_tokens_1.LINK_MARKUP_3_TOKEN.value);
                const linkChunks = [markup_tokens_1.LINK_MARKUP_1_TOKEN.value, secondLinkSplit[1], markup_tokens_1.LINK_MARKUP_2_TOKEN.value, thirdLinkSplit[0], markup_tokens_1.LINK_MARKUP_3_TOKEN.value];
                tokens = [
                    markup_tokens_1.LINK_MARKUP_1_TOKEN,
                    ...this.getTokensFromRemainingText(linkChunks[1]),
                    markup_tokens_1.LINK_MARKUP_2_TOKEN,
                    ...this.getTokensFromRemainingText(linkChunks[3]),
                    markup_tokens_1.LINK_MARKUP_3_TOKEN,
                ];
                this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[4].length);
            }
            if (unmatchedTexts[1].length) {
                tokens.push(...this.getTokensFromRemainingText(unmatchedTexts[1]));
            }
        }
        return tokens;
    }
    adjustCursor(shouldIncrement, offset) {
        this.cursor[1] += offset;
        if (shouldIncrement || (this.cursor[1] === this.blocksAndTriggers[this.cursor[0]].length)) {
            this.cursor[0]++;
            this.cursor[1] = 0;
        }
    }
}
exports.default = Lexer;
