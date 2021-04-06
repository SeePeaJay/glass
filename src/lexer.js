"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const engram_element_patterns_1 = require("./engram-element-patterns");
const tokens_1 = __importDefault(require("./tokens"));
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
            return tokens_1.default.BLANK_LINE;
        }
        // block triggers
        if (this.cursor[0] % 2) {
            return this.getTokenFromBlockTrigger();
        }
        // block markups
        if (this.cursor[1] === 0) {
            const blockMarkupsPattern = new RegExp(`${engram_element_patterns_1.HEADING_1_MARKUP_PATTERN.source}|${engram_element_patterns_1.HEADING_2_MARKUP_PATTERN.source}|${engram_element_patterns_1.HEADING_3_MARKUP_PATTERN.source}|${engram_element_patterns_1.UNORDERED_LIST_MARKUP_PATTERN.source}|${engram_element_patterns_1.ORDERED_LIST_MARKUP_PATTERN.source}|${engram_element_patterns_1.HORIZONTAL_RULE_MARKUP_PATTERN.source}|^${engram_element_patterns_1.IMAGE_MARKUP_PATTERN.source}$`);
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
                name: 26 /* NEW_INDENTED_BLOCK_TRIGGER */,
                value: this.blocksAndTriggers[this.cursor[0]],
            };
        }
        else {
            token = {
                name: 25 /* NEW_BLOCK_TRIGGER */,
                value: this.blocksAndTriggers[this.cursor[0]],
            };
        }
        this.adjustCursor(true, 0);
        return token;
    }
    getTokenFromBlockMarkup(blockMarkup) {
        let token;
        if (blockMarkup === tokens_1.default.HEADING_1_MARKUP.value) {
            token = tokens_1.default.HEADING_1_MARKUP;
        }
        else if (blockMarkup === tokens_1.default.HEADING_2_MARKUP.value) {
            token = tokens_1.default.HEADING_2_MARKUP;
        }
        else if (blockMarkup === tokens_1.default.HEADING_3_MARKUP.value) {
            token = tokens_1.default.HEADING_3_MARKUP;
        }
        else if (blockMarkup === tokens_1.default.UNORDERED_LIST_MARKUP.value) {
            token = tokens_1.default.UNORDERED_LIST_MARKUP;
        }
        else if (blockMarkup.match(engram_element_patterns_1.ORDERED_LIST_MARKUP_PATTERN)) {
            token = {
                name: 5 /* ORDERED_LIST_MARKUP */,
                value: blockMarkup,
            };
        }
        else if (blockMarkup === tokens_1.default.HORIZONTAL_RULE_MARKUP.value) {
            token = tokens_1.default.HORIZONTAL_RULE_MARKUP;
        }
        else {
            const imageTokens = this.getTokensFromImageMarkup(blockMarkup);
            token = imageTokens.shift();
            this.tokenQueue.push(...imageTokens);
        }
        if (!blockMarkup.match(engram_element_patterns_1.IMAGE_MARKUP_PATTERN)) {
            this.adjustCursor(false, blockMarkup.length);
        }
        return token;
    }
    getTokensFromImageMarkup(imageMarkup) {
        const tokens = [
            tokens_1.default.IMAGE_MARKUP_1,
            {
                name: 9 /* IMAGE_PATH */,
                value: imageMarkup.substring(tokens_1.default.IMAGE_MARKUP_1.value.length, imageMarkup.length - tokens_1.default.IMAGE_MARKUP_2.value.length),
            },
            tokens_1.default.IMAGE_MARKUP_2,
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
                    name: 24 /* TEXT */,
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
                    name: 24 /* TEXT */,
                    value: unmatchedTexts[0],
                });
                this.adjustCursor(false, unmatchedTexts[0].length);
            }
            if (inlineElement.startsWith(tokens_1.default.IMAGE_MARKUP_1.value)) {
                tokens.push(...this.getTokensFromImageMarkup(inlineElement));
            }
            else if (inlineElement.startsWith(tokens_1.default.LEFT_BOLD_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromBoldText(inlineElement));
            }
            else if (inlineElement.startsWith(tokens_1.default.LEFT_ITALIC_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromItalicText(inlineElement));
            }
            else if (inlineElement.startsWith(tokens_1.default.LEFT_UNDERLINED_TEXT_MARKUP.value) && inlineElement.endsWith(tokens_1.default.RIGHT_UNDERLINED_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromUnderlinedText(inlineElement));
            }
            else if (inlineElement.startsWith(tokens_1.default.LEFT_HIGHLIGHTED_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromHighlightedText(inlineElement));
            }
            else if (inlineElement.startsWith(tokens_1.default.LEFT_STRIKETHROUGH_TEXT_MARKUP.value)) {
                tokens.push(...this.getTokensFromStrikethroughText(inlineElement));
            }
            else if (inlineElement.startsWith(tokens_1.default.LINK_MARKUP_1.value) && inlineElement.endsWith(tokens_1.default.LINK_MARKUP_3.value)) {
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
        this.ignoredPatterns.set(engram_element_patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(tokens_1.default.LEFT_BOLD_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(tokens_1.default.LEFT_BOLD_TEXT_MARKUP.value.length, inlineElement.length - tokens_1.default.RIGHT_BOLD_TEXT_MARKUP.value.length)), tokens_1.default.RIGHT_BOLD_TEXT_MARKUP);
        this.adjustCursor(false, tokens_1.default.LEFT_BOLD_TEXT_MARKUP.value.length + tokens_1.default.RIGHT_BOLD_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(engram_element_patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromItalicText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(engram_element_patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(tokens_1.default.LEFT_ITALIC_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(tokens_1.default.LEFT_ITALIC_TEXT_MARKUP.value.length, inlineElement.length - tokens_1.default.RIGHT_ITALIC_TEXT_MARKUP.value.length)), tokens_1.default.RIGHT_ITALIC_TEXT_MARKUP);
        this.adjustCursor(false, tokens_1.default.LEFT_ITALIC_TEXT_MARKUP.value.length + tokens_1.default.RIGHT_ITALIC_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(engram_element_patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromUnderlinedText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(engram_element_patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(tokens_1.default.LEFT_UNDERLINED_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(tokens_1.default.LEFT_UNDERLINED_TEXT_MARKUP.value.length, inlineElement.length - tokens_1.default.RIGHT_UNDERLINED_TEXT_MARKUP.value.length)), tokens_1.default.RIGHT_UNDERLINED_TEXT_MARKUP);
        this.adjustCursor(false, tokens_1.default.LEFT_UNDERLINED_TEXT_MARKUP.value.length + tokens_1.default.RIGHT_UNDERLINED_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(engram_element_patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromHighlightedText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(engram_element_patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(tokens_1.default.LEFT_HIGHLIGHTED_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(tokens_1.default.LEFT_HIGHLIGHTED_TEXT_MARKUP.value.length, inlineElement.length - tokens_1.default.RIGHT_HIGHLIGHTED_TEXT_MARKUP.value.length)), tokens_1.default.RIGHT_HIGHLIGHTED_TEXT_MARKUP);
        this.adjustCursor(false, tokens_1.default.LEFT_HIGHLIGHTED_TEXT_MARKUP.value.length + tokens_1.default.RIGHT_HIGHLIGHTED_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(engram_element_patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromStrikethroughText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(engram_element_patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(tokens_1.default.LEFT_STRIKETHROUGH_TEXT_MARKUP, ...this.getTokensFromRemainingText(inlineElement.substring(tokens_1.default.LEFT_STRIKETHROUGH_TEXT_MARKUP.value.length, inlineElement.length - tokens_1.default.RIGHT_STRIKETHROUGH_TEXT_MARKUP.value.length)), tokens_1.default.RIGHT_STRIKETHROUGH_TEXT_MARKUP);
        this.adjustCursor(false, tokens_1.default.LEFT_STRIKETHROUGH_TEXT_MARKUP.value.length + tokens_1.default.RIGHT_STRIKETHROUGH_TEXT_MARKUP.value.length);
        this.ignoredPatterns.delete(engram_element_patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromLink(inlineElement) {
        let tokens = [];
        this.ignoredPatterns.set(engram_element_patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        const firstLinkSplit = inlineElement.split(tokens_1.default.LINK_MARKUP_2.value);
        const secondLinkSplit = firstLinkSplit[0].split(tokens_1.default.LINK_MARKUP_1.value);
        const thirdLinkSplit = firstLinkSplit[1].split(tokens_1.default.LINK_MARKUP_3.value);
        const linkChunks = [tokens_1.default.LINK_MARKUP_1.value, secondLinkSplit[1], tokens_1.default.LINK_MARKUP_2.value, thirdLinkSplit[0], tokens_1.default.LINK_MARKUP_3.value];
        tokens = [
            tokens_1.default.LINK_MARKUP_1,
            ...this.getTokensFromRemainingText(linkChunks[1]),
            tokens_1.default.LINK_MARKUP_2,
            {
                name: 23 /* LINK_URL */,
                value: linkChunks[3],
            },
            tokens_1.default.LINK_MARKUP_3,
        ];
        this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[3].length + linkChunks[4].length);
        this.ignoredPatterns.delete(engram_element_patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getUpdatedInlinePattern() {
        const inlinePatterns = new Map([[engram_element_patterns_1.IMAGE_MARKUP_PATTERN.source, 0], [engram_element_patterns_1.BOLD_TEXT_PATTERN.source, 1], [engram_element_patterns_1.ITALIC_TEXT_PATTERN.source, 2], [engram_element_patterns_1.UNDERLINED_TEXT_PATTERN.source, 3], [engram_element_patterns_1.HIGHLIGHTED_TEXT_PATTERN.source, 4], [engram_element_patterns_1.STRIKETHROUGH_TEXT_PATTERN.source, 5], [engram_element_patterns_1.LINK_PATTERN.source, 6]]);
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
