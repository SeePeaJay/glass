"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var patterns_1 = require("./patterns");
var markup_tokens_1 = require("./markup_tokens");
var Lexer = /** @class */ (function () {
    function Lexer() {
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
    }
    Lexer.prototype.processUserInput = function (userInput) {
        this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
        this.splitUserInputIntoBlocksAndTriggers(userInput);
        this.removeUnnecessaryTabsFromBlocksAndTriggers();
        // process tabs in blocksandtriggers here
    };
    Lexer.prototype.splitUserInputIntoBlocksAndTriggers = function (input) {
        var _a;
        var split = input.split(patterns_1.TRIGGER_PATTERN); // split any instances of new (indented) block trigger
        (_a = this.blocksAndTriggers).push.apply(_a, split);
    };
    Lexer.prototype.removeUnnecessaryTabsFromBlocksAndTriggers = function () {
        var maxIndentLevel = 1;
        for (var i = 1; i < this.blocksAndTriggers.length; i += 2) {
            if (this.blocksAndTriggers[i].includes('\t')) {
                var split = this.blocksAndTriggers[i].split(/(\n)(?!\n)/g);
                var tabCharacters = split[2];
                if (tabCharacters.length > maxIndentLevel) {
                    var array = [split[0], split[1], '\t'.repeat(maxIndentLevel)];
                    this.blocksAndTriggers[i] = array.join('');
                }
            }
            else {
                maxIndentLevel = 1;
            }
        }
        for (var j = 0; j < this.blocksAndTriggers.length; j += 2) {
            this.blocksAndTriggers[j] = this.blocksAndTriggers[j].replace(/\t+/g, '');
        }
    };
    Lexer.prototype.isEoF = function () {
        return this.cursor[0] === this.blocksAndTriggers.length;
    };
    Lexer.prototype.getNextToken = function () {
        if (this.tokenQueue.length) {
            return this.tokenQueue.shift();
        }
        if ((this.blocksAndTriggers.length === 1 && this.blocksAndTriggers[0] === '') || this.isEoF()) {
            return null;
        }
        return this.getTokenFromEngram();
    };
    Lexer.prototype.getTokenFromEngram = function () {
        var _a;
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
            var blockMarkupsPattern = new RegExp(patterns_1.HEADING_1_MARKUP_PATTERN.source + "|" + patterns_1.HEADING_2_MARKUP_PATTERN.source + "|" + patterns_1.HEADING_3_MARKUP_PATTERN.source + "|" + patterns_1.UNORDERED_LIST_MARKUP_PATTERN.source + "|" + patterns_1.ORDERED_LIST_MARKUP_PATTERN.source + "|" + patterns_1.HORIZONTAL_RULE_MARKUP_PATTERN.source + "|^" + patterns_1.IMAGE_MARKUP_PATTERN.source + "$");
            var blockMarkupMatch = this.blocksAndTriggers[this.cursor[0]].match(blockMarkupsPattern);
            if (blockMarkupMatch) {
                return this.getTokenFromBlockMarkup(blockMarkupMatch[0]);
            }
        }
        // remaining text
        var remainingText = this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]);
        var remainingTokensInCurrentBlock = this.getTokensFromRemainingText(remainingText);
        var token = remainingTokensInCurrentBlock.shift();
        (_a = this.tokenQueue).push.apply(_a, remainingTokensInCurrentBlock);
        return token;
    };
    Lexer.prototype.getTokenFromBlockTrigger = function () {
        var token;
        if (this.blocksAndTriggers[this.cursor[0]].includes('\t')) {
            token = {
                name: 'NEW INDENTED BLOCK TRIGGER',
                value: this.blocksAndTriggers[this.cursor[0]]
            };
        }
        else {
            token = {
                name: 'NEW BLOCK TRIGGER',
                value: this.blocksAndTriggers[this.cursor[0]]
            };
        }
        this.adjustCursor(true, 0);
        return token;
    };
    Lexer.prototype.getTokenFromBlockMarkup = function (blockMarkup) {
        var _a;
        var token;
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
                value: blockMarkup
            };
        }
        else if (blockMarkup === markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN.value) {
            token = markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN;
        }
        else {
            var imageTokens = this.getTokensFromImageMarkup(blockMarkup);
            token = imageTokens.shift();
            (_a = this.tokenQueue).push.apply(_a, imageTokens);
        }
        if (!blockMarkup.match(patterns_1.IMAGE_MARKUP_PATTERN)) {
            this.adjustCursor(false, blockMarkup.length);
        }
        return token;
    };
    Lexer.prototype.getTokensFromImageMarkup = function (imageMarkup) {
        var tokens = [
            markup_tokens_1.IMAGE_MARKUP_1_TOKEN,
            {
                name: 'IMAGE PATH',
                value: imageMarkup.substring(markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value.length, imageMarkup.length - markup_tokens_1.IMAGE_MARKUP_2_TOKEN.value.length)
            },
            markup_tokens_1.IMAGE_MARKUP_2_TOKEN,
        ];
        this.adjustCursor(false, imageMarkup.length);
        return tokens;
    };
    Lexer.prototype.getTokensFromRemainingText = function (remainingText) {
        var tokens = [];
        var inlinePattern = new RegExp(patterns_1.IMAGE_MARKUP_PATTERN.source + "|" + patterns_1.BOLD_TEXT_PATTERN.source + "|" + patterns_1.ITALIC_TEXT_PATTERN.source + "|" + patterns_1.UNDERLINED_TEXT_PATTERN.source + "|" + patterns_1.HIGHLIGHTED_TEXT_PATTERN.source + "|" + patterns_1.STRIKETHROUGH_TEXT_PATTERN.source + "|" + patterns_1.LINK_PATTERN.source);
        var inlineMatch = remainingText.match(inlinePattern);
        if (!inlineMatch) {
            tokens = [
                {
                    name: 'TEXT',
                    value: remainingText
                },
            ];
            this.adjustCursor(false, remainingText.length);
        }
        else {
            var inline = inlineMatch[0];
            var unmatchedTexts = remainingText.split(inline);
            if (unmatchedTexts[0].length) {
                tokens.push({
                    name: 'TEXT',
                    value: unmatchedTexts[0]
                });
                this.adjustCursor(false, unmatchedTexts[0].length);
            }
            if (inline.startsWith(markup_tokens_1.IMAGE_MARKUP_1_TOKEN.value)) {
                tokens.push.apply(tokens, this.getTokensFromImageMarkup(inline));
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value)) {
                tokens.push.apply(tokens, __spreadArrays([markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN], this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN.value.length)), [markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN]));
                this.adjustCursor(false, markup_tokens_1.LEFT_BOLD_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_BOLD_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value)) {
                tokens.push.apply(tokens, __spreadArrays([markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN], this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value.length)), [markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN]));
                this.adjustCursor(false, markup_tokens_1.LEFT_ITALIC_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_ITALIC_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value) && inline.endsWith(markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value)) {
                tokens.push.apply(tokens, __spreadArrays([markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN], this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length)), [markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN]));
                this.adjustCursor(false, markup_tokens_1.LEFT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value)) {
                tokens.push.apply(tokens, __spreadArrays([markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN], this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length)), [markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN]));
                this.adjustCursor(false, markup_tokens_1.LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value)) {
                tokens.push.apply(tokens, __spreadArrays([markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN], this.getTokensFromRemainingText(inline.substring(markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length, inline.length - markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length)), [markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN]));
                this.adjustCursor(false, markup_tokens_1.LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length + markup_tokens_1.RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN.value.length);
            }
            else if (inline.startsWith(markup_tokens_1.LINK_MARKUP_1_TOKEN.value) && inline.endsWith(markup_tokens_1.LINK_MARKUP_3_TOKEN.value)) {
                var firstLinkSplit = inline.split(markup_tokens_1.LINK_MARKUP_2_TOKEN.value);
                var secondLinkSplit = firstLinkSplit[0].split(markup_tokens_1.LINK_MARKUP_1_TOKEN.value);
                var thirdLinkSplit = firstLinkSplit[1].split(markup_tokens_1.LINK_MARKUP_3_TOKEN.value);
                var linkChunks = [markup_tokens_1.LINK_MARKUP_1_TOKEN.value, secondLinkSplit[1], markup_tokens_1.LINK_MARKUP_2_TOKEN.value, thirdLinkSplit[0], markup_tokens_1.LINK_MARKUP_3_TOKEN.value];
                tokens = __spreadArrays([
                    markup_tokens_1.LINK_MARKUP_1_TOKEN
                ], this.getTokensFromRemainingText(linkChunks[1]), [
                    markup_tokens_1.LINK_MARKUP_2_TOKEN,
                    {
                        name: 'LINK URL',
                        value: linkChunks[3]
                    },
                    markup_tokens_1.LINK_MARKUP_3_TOKEN,
                ]);
                this.adjustCursor(false, linkChunks[0].length + linkChunks[2].length + linkChunks[3].length + linkChunks[4].length);
            }
            if (unmatchedTexts[1].length) {
                tokens.push.apply(tokens, this.getTokensFromRemainingText(unmatchedTexts[1]));
            }
        }
        return tokens;
    };
    Lexer.prototype.adjustCursor = function (shouldIncrement, offset) {
        this.cursor[1] += offset;
        if (shouldIncrement || (this.cursor[1] === this.blocksAndTriggers[this.cursor[0]].length)) {
            this.cursor[0]++;
            this.cursor[1] = 0;
        }
    };
    return Lexer;
}());
exports["default"] = Lexer;
