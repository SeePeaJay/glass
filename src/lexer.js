"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const patterns_1 = require("./patterns");
const markup_tokens_1 = require("./markup-tokens");
class Lexer {
    constructor() {
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
        this.ignoredPatterns = new Map();
    }
    setBlocksAndTriggers(blocksAndTriggers) {
        this.blocksAndTriggers = blocksAndTriggers;
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
            {
                name: 'IMAGE PATH',
                value: imageMarkup.substring(markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value.length, imageMarkup.length - markup_tokens_1.IMAGE_MARKUP_2_TOKEN.value.length),
            },
            markup_tokens_1.IMAGE_MARKUP_2_TOKEN,
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
                    name: 'TEXT',
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
                    name: 'TEXT',
                    value: unmatchedTexts[0],
                });
                this.adjustCursor(false, unmatchedTexts[0].length);
            }
            if (inlineElement.startsWith(markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value)) {
                tokens.push(...this.getTokensFromImageMarkup(inlineElement));
            }
            else if (inlineElement.startsWith(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(...this.getTokensFromBoldText(inlineElement));
            }
            else if (inlineElement.startsWith(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(...this.getTokensFromItalicText(inlineElement));
            }
            else if (inlineElement.startsWith(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value) && inlineElement.endsWith(markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(...this.getTokensFromUnderlinedText(inlineElement));
            }
            else if (inlineElement.startsWith(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(...this.getTokensFromHighlightedText(inlineElement));
            }
            else if (inlineElement.startsWith(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value)) {
                tokens.push(...this.getTokensFromStrikethroughText(inlineElement));
            }
            else if (inlineElement.startsWith(markup_tokens_1.LINK_MARKUP_1_TOKEN.value) && inlineElement.endsWith(markup_tokens_1.LINK_MARKUP_3_TOKEN.value)) {
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
        this.ignoredPatterns.set(patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inlineElement.substring(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value.length, inlineElement.length - markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN);
        this.adjustCursor(false, markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN.value.length);
        this.ignoredPatterns.delete(patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromItalicText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inlineElement.substring(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value.length, inlineElement.length - markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN);
        this.adjustCursor(false, markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value.length);
        this.ignoredPatterns.delete(patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromUnderlinedText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inlineElement.substring(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length, inlineElement.length - markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN);
        this.adjustCursor(false, markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length);
        this.ignoredPatterns.delete(patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromHighlightedText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inlineElement.substring(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length, inlineElement.length - markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN);
        this.adjustCursor(false, markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length);
        this.ignoredPatterns.delete(patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromStrikethroughText(inlineElement) {
        const tokens = [];
        this.ignoredPatterns.set(patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        tokens.push(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN, ...this.getTokensFromRemainingText(inlineElement.substring(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length, inlineElement.length - markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length)), markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN);
        this.adjustCursor(false, markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length);
        this.ignoredPatterns.delete(patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getTokensFromLink(inlineElement) {
        let tokens = [];
        this.ignoredPatterns.set(patterns_1.BOLD_TEXT_PATTERN.source, this.ignoredPatterns.size + 1);
        const firstLinkSplit = inlineElement.split(markup_tokens_1.LINK_MARKUP_2_TOKEN.value);
        const secondLinkSplit = firstLinkSplit[0].split(markup_tokens_1.LINK_MARKUP_1_TOKEN.value);
        const thirdLinkSplit = firstLinkSplit[1].split(markup_tokens_1.LINK_MARKUP_3_TOKEN.value);
        const linkChunks = [markup_tokens_1.LINK_MARKUP_1_TOKEN.value, secondLinkSplit[1], markup_tokens_1.LINK_MARKUP_2_TOKEN.value, thirdLinkSplit[0], markup_tokens_1.LINK_MARKUP_3_TOKEN.value];
        tokens = [
            markup_tokens_1.LINK_MARKUP_1_TOKEN,
            ...this.getTokensFromRemainingText(linkChunks[1]),
            markup_tokens_1.LINK_MARKUP_2_TOKEN,
            {
                name: 'LINK URL',
                value: linkChunks[3],
            },
            markup_tokens_1.LINK_MARKUP_3_TOKEN,
        ];
        this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[3].length + linkChunks[4].length);
        this.ignoredPatterns.delete(patterns_1.BOLD_TEXT_PATTERN.source);
        return tokens;
    }
    getUpdatedInlinePattern() {
        const inlinePatterns = new Map([[patterns_1.IMAGE_MARKUP_PATTERN.source, 0], [patterns_1.BOLD_TEXT_PATTERN.source, 1], [patterns_1.ITALIC_TEXT_PATTERN.source, 2], [patterns_1.UNDERLINED_TEXT_PATTERN.source, 3], [patterns_1.HIGHLIGHTED_TEXT_PATTERN.source, 4], [patterns_1.STRIKETHROUGH_TEXT_PATTERN.source, 5], [patterns_1.LINK_PATTERN.source, 6]]);
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
