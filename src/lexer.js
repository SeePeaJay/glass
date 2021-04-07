"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
class Lexer {
    constructor() {
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
        this.ignoredPatterns = new Map();
    }
    processBlocksAndTriggers(blocksAndTriggers) {
        this.blocksAndTriggers = blocksAndTriggers;
        this.cursor = [0, 0];
        this.tokenQueue = [];
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
            return constants_1.TOKENS.BLANK_LINE;
        }
        // block triggers
        if (this.cursor[0] % 2) {
            return this.getTokenFromBlockTrigger();
        }
        // block markups
        if (this.cursor[1] === 0) {
            const blockMarkupsPattern = new RegExp(`${constants_1.PATTERNS.HEADING_1_MARKUP.source}|${constants_1.PATTERNS.HEADING_2_MARKUP.source}|${constants_1.PATTERNS.HEADING_3_MARKUP.source}|${constants_1.PATTERNS.UNORDERED_LIST_MARKUP.source}|${constants_1.PATTERNS.ORDERED_LIST_MARKUP.source}|${constants_1.PATTERNS.HORIZONTAL_RULE_MARKUP.source}|^${constants_1.PATTERNS.IMAGE.source}$`);
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
                name: constants_1.TOKEN_TYPE.NEW_INDENTED_BLOCK_TRIGGER,
                value: this.blocksAndTriggers[this.cursor[0]],
            };
        }
        else {
            token = {
                name: constants_1.TOKEN_TYPE.NEW_BLOCK_TRIGGER,
                value: this.blocksAndTriggers[this.cursor[0]],
            };
        }
        this.adjustCursor(true, 0);
        return token;
    }
    getTokenFromBlockMarkup(blockMarkup) {
        let token;
        if (blockMarkup === constants_1.TOKENS.HEADING_1_MARKUP.value) {
            token = constants_1.TOKENS.HEADING_1_MARKUP;
        }
        else if (blockMarkup === constants_1.TOKENS.HEADING_2_MARKUP.value) {
            token = constants_1.TOKENS.HEADING_2_MARKUP;
        }
        else if (blockMarkup === constants_1.TOKENS.HEADING_3_MARKUP.value) {
            token = constants_1.TOKENS.HEADING_3_MARKUP;
        }
        else if (blockMarkup === constants_1.TOKENS.UNORDERED_LIST_MARKUP.value) {
            token = constants_1.TOKENS.UNORDERED_LIST_MARKUP;
        }
        else if (blockMarkup.match(constants_1.PATTERNS.ORDERED_LIST_MARKUP)) {
            token = {
                name: constants_1.TOKEN_TYPE.ORDERED_LIST_MARKUP,
                value: blockMarkup,
            };
        }
        else if (blockMarkup === constants_1.TOKENS.HORIZONTAL_RULE_MARKUP.value) {
            token = constants_1.TOKENS.HORIZONTAL_RULE_MARKUP;
        }
        else {
            const imageTokens = this.getTokensFromImageMarkup(blockMarkup);
            token = imageTokens.shift();
            this.tokenQueue.push(...imageTokens);
        }
        if (!blockMarkup.match(constants_1.PATTERNS.IMAGE)) {
            this.adjustCursor(false, blockMarkup.length);
        }
        return token;
    }
    getTokensFromImageMarkup(imageMarkup) {
        const tokens = [
            constants_1.TOKENS.IMAGE_MARKUP_1,
            {
                name: constants_1.TOKEN_TYPE.IMAGE_PATH,
                value: imageMarkup.substring(constants_1.TOKENS.IMAGE_MARKUP_1.value.length, imageMarkup.length - constants_1.TOKENS.IMAGE_MARKUP_2.value.length),
            },
            constants_1.TOKENS.IMAGE_MARKUP_2,
        ];
        this.adjustCursor(false, imageMarkup.length);
        return tokens;
    }
    getTokensFromRemainingText(remainingText) {
        let tokens = [];
        const inlinePattern = this.getUpdatedInlinePattern();
        const matchedResult = remainingText.match(inlinePattern);
        if (!matchedResult) {
            tokens = [
                {
                    name: constants_1.TOKEN_TYPE.TEXT,
                    value: remainingText,
                },
            ];
            this.adjustCursor(false, remainingText.length);
        }
        else {
            const inlineElement = matchedResult[0];
            const unmatchedTexts = remainingText.split(inlineElement);
            if (unmatchedTexts[0].length) { // any preceding text
                tokens.push({
                    name: constants_1.TOKEN_TYPE.TEXT,
                    value: unmatchedTexts[0],
                });
                this.adjustCursor(false, unmatchedTexts[0].length);
            }
            if (inlineElement.startsWith(constants_1.TOKENS.IMAGE_MARKUP_1.value)) {
                tokens.push(...this.getTokensFromImageMarkup(inlineElement));
            }
            else if (inlineElement.startsWith(constants_1.TOKENS.LEFT_BOLD_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromBoldText(inlineElement));
            }
            else if (inlineElement.startsWith(constants_1.TOKENS.LEFT_ITALIC_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromItalicText(inlineElement));
            }
            else if (inlineElement.startsWith(constants_1.TOKENS.LEFT_UNDERLINED_TEXT_MARKUP.value) && inlineElement.endsWith(constants_1.TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromUnderlinedText(inlineElement));
            }
            else if (inlineElement.startsWith(constants_1.TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromHighlightedText(inlineElement));
            }
            else if (inlineElement.startsWith(constants_1.TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromStrikethroughText(inlineElement));
            }
            else if (inlineElement.startsWith(constants_1.TOKENS.LINK_MARKUP_1.value) && inlineElement.endsWith(constants_1.TOKENS.LINK_MARKUP_3.value)) {
                tokens.push(...this.getTokensFromLink(inlineElement));
            }
            if (unmatchedTexts[1].length) {
                tokens.push(...this.getTokensFromRemainingText(unmatchedTexts[1]));
            }
        }
        return tokens;
    }
    getTokensFromBoldText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(constants_1.PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
        tokens.push(constants_1.TOKENS.LEFT_BOLD_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(constants_1.TOKENS.LEFT_BOLD_TEXT_MARKUP.value.length, inlineElement.length - constants_1.TOKENS.RIGHT_BOLD_TEXT_MARKUP.value.length)), constants_1.TOKENS.RIGHT_BOLD_TEXT_MARKUP);
        this.adjustCursor(false, constants_1.TOKENS.LEFT_BOLD_TEXT_MARKUP.value.length + constants_1.TOKENS.RIGHT_BOLD_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(constants_1.PATTERNS.BOLD_TEXT.source);
        return tokens;
    }
    getTokensFromItalicText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(constants_1.PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
        tokens.push(constants_1.TOKENS.LEFT_ITALIC_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(constants_1.TOKENS.LEFT_ITALIC_TEXT_MARKUP.value.length, inlineElement.length - constants_1.TOKENS.RIGHT_ITALIC_TEXT_MARKUP.value.length)), constants_1.TOKENS.RIGHT_ITALIC_TEXT_MARKUP);
        this.adjustCursor(false, constants_1.TOKENS.LEFT_ITALIC_TEXT_MARKUP.value.length + constants_1.TOKENS.RIGHT_ITALIC_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(constants_1.PATTERNS.BOLD_TEXT.source);
        return tokens;
    }
    getTokensFromUnderlinedText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(constants_1.PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
        tokens.push(constants_1.TOKENS.LEFT_UNDERLINED_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(constants_1.TOKENS.LEFT_UNDERLINED_TEXT_MARKUP.value.length, inlineElement.length - constants_1.TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP.value.length)), constants_1.TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP);
        this.adjustCursor(false, constants_1.TOKENS.LEFT_UNDERLINED_TEXT_MARKUP.value.length + constants_1.TOKENS.RIGHT_UNDERLINED_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(constants_1.PATTERNS.BOLD_TEXT.source);
        return tokens;
    }
    getTokensFromHighlightedText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(constants_1.PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
        tokens.push(constants_1.TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(constants_1.TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP.value.length, inlineElement.length - constants_1.TOKENS.RIGHT_HIGHLIGHTED_TEXT_MARKUP.value.length)), constants_1.TOKENS.RIGHT_HIGHLIGHTED_TEXT_MARKUP);
        this.adjustCursor(false, constants_1.TOKENS.LEFT_HIGHLIGHTED_TEXT_MARKUP.value.length + constants_1.TOKENS.RIGHT_HIGHLIGHTED_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(constants_1.PATTERNS.BOLD_TEXT.source);
        return tokens;
    }
    getTokensFromStrikethroughText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(constants_1.PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
        tokens.push(constants_1.TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(constants_1.TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP.value.length, inlineElement.length - constants_1.TOKENS.RIGHT_STRIKETHROUGH_TEXT_MARKUP.value.length)), constants_1.TOKENS.RIGHT_STRIKETHROUGH_TEXT_MARKUP);
        this.adjustCursor(false, constants_1.TOKENS.LEFT_STRIKETHROUGH_TEXT_MARKUP.value.length + constants_1.TOKENS.RIGHT_STRIKETHROUGH_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(constants_1.PATTERNS.BOLD_TEXT.source);
        return tokens;
    }
    getTokensFromLink(inlineElement) {
        let tokens = [];
        this.ignoredPatterns.set(constants_1.PATTERNS.BOLD_TEXT.source, this.ignoredPatterns.size + 1);
        const firstLinkSplit = inlineElement.split(constants_1.TOKENS.LINK_MARKUP_2.value);
        const secondLinkSplit = firstLinkSplit[0].split(constants_1.TOKENS.LINK_MARKUP_1.value);
        const thirdLinkSplit = firstLinkSplit[1].split(constants_1.TOKENS.LINK_MARKUP_3.value);
        const linkChunks = [constants_1.TOKENS.LINK_MARKUP_1.value, secondLinkSplit[1], constants_1.TOKENS.LINK_MARKUP_2.value, thirdLinkSplit[0], constants_1.TOKENS.LINK_MARKUP_3.value];
        tokens = [
            constants_1.TOKENS.LINK_MARKUP_1,
            ...this.getTokensFromRemainingText(linkChunks[1]),
            constants_1.TOKENS.LINK_MARKUP_2,
            {
                name: constants_1.TOKEN_TYPE.LINK_URL,
                value: linkChunks[3],
            },
            constants_1.TOKENS.LINK_MARKUP_3,
        ];
        this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[3].length + linkChunks[4].length);
        this.ignoredPatterns.delete(constants_1.PATTERNS.BOLD_TEXT.source);
        return tokens;
    }
    getUpdatedInlinePattern() {
        const inlinePatterns = new Map([[constants_1.PATTERNS.IMAGE.source, 0], [constants_1.PATTERNS.BOLD_TEXT.source, 1], [constants_1.PATTERNS.ITALIC_TEXT.source, 2], [constants_1.PATTERNS.UNDERLINED_TEXT.source, 3], [constants_1.PATTERNS.HIGHLIGHTED_TEXT.source, 4], [constants_1.PATTERNS.STRIKETHROUGH_TEXT.source, 5], [constants_1.PATTERNS.LINK.source, 6]]);
        for (const key of this.ignoredPatterns.keys()) {
            inlinePatterns.delete(key);
        }
        let isFirstIteration = true;
        let inlinePatternsRegExpString = '';
        for (const key of inlinePatterns.keys()) {
            if (isFirstIteration) {
                inlinePatternsRegExpString = `${key}`;
                isFirstIteration = false;
            }
            else {
                inlinePatternsRegExpString += `|${key}`;
            }
        }
        return new RegExp(inlinePatternsRegExpString);
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
