"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("./lexer"));
const markup_tokens_1 = require("./markup_tokens");
class Parser {
    constructor() {
        this.lexer = new lexer_1.default();
        this.lookahead = null;
    }
    parse(userInput) {
        this.lexer.processUserInput(userInput);
        this.lookahead = this.lexer.getNextToken();
        return this.getEngram();
    }
    getEngram() {
        const engramValue = [];
        if (this.lookahead) {
            engramValue.push(this.getBlock());
            while (this.lookahead) {
                engramValue.push(this.getNewBlockTrigger());
                engramValue.push(this.getBlock());
            }
        }
        return {
            name: 'Engram',
            value: engramValue,
        };
    }
    getBlock() {
        let blockName = '';
        const blockValue = [];
        switch (this.lookahead.name) {
            case markup_tokens_1.HEADING_1_MARKUP_TOKEN.name:
                blockName = 'HEADING 1 BLOCK';
                blockValue.push(this.getHeading1Block());
                break;
            case markup_tokens_1.HEADING_2_MARKUP_TOKEN.name:
                blockName = 'HEADING 2 BLOCK';
                blockValue.push(this.getHeading2Block());
                break;
            case markup_tokens_1.HEADING_3_MARKUP_TOKEN.name:
                blockName = 'HEADING 3 BLOCK';
                blockValue.push(this.getHeading3Block());
                break;
            case markup_tokens_1.UNORDERED_LIST_MARKUP_TOKEN.name:
                blockName = 'UNORDERED LIST BLOCK';
                blockValue.push(this.getUnorderedListBlock());
                break;
            case 'ORDERED LIST MARKUP':
                blockName = 'ORDERED LIST BLOCK';
                blockValue.push(this.getOrderedListBlock());
                break;
            case markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN.name:
                blockName = 'HORIZONTAL RULE BLOCK';
                blockValue.push(this.getHorizontalRuleBlock());
                break;
            case 'NON-CONTROL CHARACTERS':
                blockName = 'PARAGRAPH BLOCK';
                blockValue.push(this.getParagraphBlock());
                break;
            case markup_tokens_1.IMAGE_MARKUP_1_TOKEN.name:
                blockName = 'IMAGE BLOCK';
                blockValue.push(this.getImage());
                while (this.lookahead) {
                    blockValue.push(this.getNewIndentedBlockTrigger());
                    blockValue.push(this.getBlock());
                }
                break;
            default:
                throw new SyntaxError('Block: unexpected block production');
        }
        return {
            name: blockName,
            value: blockValue,
        };
    }
    getNewBlockTrigger() {
        const token = this.eat('NEW BLOCK TRIGGER');
        return {
            name: 'NEW BLOCK TRIGGER',
            value: token.value,
        };
    }
    getNewIndentedBlockTrigger() {
        const token = this.eat('NEW INDENTED BLOCK TRIGGER');
        return {
            name: 'NEW INDENTED BLOCK TRIGGER',
            value: token.value,
        };
    }
    getHeading1Block() {
        const heading1MarkupToken = this.eat(markup_tokens_1.HEADING_1_MARKUP_TOKEN.name);
        const heading1BlockValue = [{
                name: heading1MarkupToken.name,
                value: heading1MarkupToken.value,
            }];
        if (this.lookahead) {
            heading1BlockValue.push(this.getText());
        }
        while (this.lookahead) {
            heading1BlockValue.push(this.getNewIndentedBlockTrigger());
            heading1BlockValue.push(this.getBlock());
        }
        return {
            name: 'HEADING 1 BLOCK',
            value: heading1BlockValue,
        };
    }
    getHeading2Block() {
        const heading2MarkupToken = this.eat(markup_tokens_1.HEADING_2_MARKUP_TOKEN.name);
        const heading2BlockValue = [{
                name: heading2MarkupToken.name,
                value: heading2MarkupToken.value,
            }];
        if (this.lookahead) {
            heading2BlockValue.push(this.getText());
        }
        while (this.lookahead) {
            heading2BlockValue.push(this.getNewIndentedBlockTrigger());
            heading2BlockValue.push(this.getBlock());
        }
        return {
            name: 'HEADING 2 BLOCK',
            value: heading2BlockValue,
        };
    }
    getHeading3Block() {
        const heading3MarkupToken = this.eat(markup_tokens_1.HEADING_3_MARKUP_TOKEN.name);
        const heading3BlockValue = [{
                name: heading3MarkupToken.name,
                value: heading3MarkupToken.value,
            }];
        if (this.lookahead) {
            heading3BlockValue.push(this.getText());
        }
        while (this.lookahead) {
            heading3BlockValue.push(this.getNewIndentedBlockTrigger());
            heading3BlockValue.push(this.getBlock());
        }
        return {
            name: 'HEADING 3 BLOCK',
            value: heading3BlockValue,
        };
    }
    getUnorderedListBlock() {
        const unorderedListMarkupToken = this.eat(markup_tokens_1.UNORDERED_LIST_MARKUP_TOKEN.name);
        const unorderedListBlockValue = [{
                name: unorderedListMarkupToken.name,
                value: unorderedListMarkupToken.value,
            }];
        if (this.lookahead) {
            unorderedListBlockValue.push(this.getText());
        }
        while (this.lookahead) {
            unorderedListBlockValue.push(this.getNewIndentedBlockTrigger());
            unorderedListBlockValue.push(this.getBlock());
        }
        return {
            name: 'UNORDERED LIST BLOCK',
            value: unorderedListBlockValue,
        };
    }
    getOrderedListBlock() {
        const orderedListMarkupToken = this.eat('ORDERED LIST MARKUP');
        const orderedListBlockValue = [{
                name: orderedListMarkupToken.name,
                value: orderedListMarkupToken.value,
            }];
        if (this.lookahead) {
            orderedListBlockValue.push(this.getText());
        }
        while (this.lookahead) {
            orderedListBlockValue.push(this.getNewIndentedBlockTrigger());
            orderedListBlockValue.push(this.getBlock());
        }
        return {
            name: 'ORDERED LIST BLOCK',
            value: orderedListBlockValue,
        };
    }
    getHorizontalRuleBlock() {
        const horizontalRuleMarkupToken = this.eat(markup_tokens_1.HORIZONTAL_RULE_MARKUP_TOKEN.name);
        const horizontalRuleBlockValue = [{
                name: horizontalRuleMarkupToken.name,
                value: horizontalRuleMarkupToken.value,
            }];
        if (this.lookahead) {
            horizontalRuleBlockValue.push(this.getText());
        }
        while (this.lookahead) {
            horizontalRuleBlockValue.push(this.getNewIndentedBlockTrigger());
            horizontalRuleBlockValue.push(this.getBlock());
        }
        return {
            name: 'HORIZONTAL RULE BLOCK',
            value: horizontalRuleBlockValue,
        };
    }
    // getParagraphBlock(): ASTNode {
    // 	const horizontalRuleBlockValue: ASTNode[] = [];
    // 	switch (this.lookahead!.name) {
    // 		case 'BLANK LINE':
    // 			horizontalRuleBlockValue.push();
    // 		case ''
    // 	}
    // 	if (this.lookahead) {
    // 		horizontalRuleBlockValue.push(this.getText());
    // 	}
    // 	while (this.lookahead) {
    // 		horizontalRuleBlockValue.push(this.getNewIndentedBlockTrigger());
    // 		horizontalRuleBlockValue.push(this.getBlock());
    // 	}
    // 	return {
    // 		name: 'HORIZONTAL RULE BLOCK',
    // 		value: horizontalRuleBlockValue,
    // 	};
    // }
    // getImage(): ASTNode {
    // }
    eat(tokenName) {
        const token = this.lookahead;
        if (token == null) {
            throw new SyntaxError(`Unexpected end of input, expected: "${tokenName}"`);
        }
        if (token.name !== tokenName) {
            throw new SyntaxError(`Unexpected end of input, expected: "${tokenName}"`);
        }
        this.lookahead = this.lexer.getNextToken();
        return token;
    }
}
exports.default = Parser;
