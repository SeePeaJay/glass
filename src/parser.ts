import Lexer from './lexer';
import { Token } from './types';
// import {
// 	HEADING_1_MARKUP_TOKEN, HEADING_2_MARKUP_TOKEN, HEADING_3_MARKUP_TOKEN, UNORDERED_LIST_MARKUP_TOKEN, HORIZONTAL_RULE_MARKUP_TOKEN, IMAGE_MARKUP_1_TOKEN, IMAGE_MARKUP_2_TOKEN, LEFT_BOLD_TEXT_MARKUP_TOKEN, RIGHT_BOLD_TEXT_MARKUP_TOKEN, LEFT_ITALIC_TEXT_MARKUP_TOKEN, RIGHT_ITALIC_TEXT_MARKUP_TOKEN, LEFT_UNDERLINED_TEXT_MARKUP_TOKEN, RIGHT_UNDERLINED_TEXT_MARKUP_TOKEN, LEFT_HIGHLIGHTED_TEXT_MARKUP_TOKEN, RIGHT_HIGHLIGHTED_TEXT_MARKUP_TOKEN, LEFT_STRIKETHROUGH_TEXT_MARKUP_TOKEN, RIGHT_STRIKETHROUGH_TEXT_MARKUP_TOKEN, LINK_MARKUP_1_TOKEN, LINK_MARKUP_2_TOKEN, LINK_MARKUP_3_TOKEN,
// } from './markup_tokens';

class Parser {
    lexer: Lexer;
    lookahead: Token | null;

    constructor() {
        this.lexer = new Lexer();
        this.lookahead = null;
    }

    parse(userInput: string) {
        this.lexer.processUserInput(userInput);
        this.lookahead = this.lexer.getNextToken();
        return this.getEngram();
    }

    getEngram() {
		const engramValue = [];

		if (this.lookahead !== null) {
			engramValue.push(this.getBlock());
			while (this.lookahead !== null) {
				engramValue.push(this.getNewBlockTrigger());
				engramValue.push(this.getBlock());
			}
		}

        return {
            name: 'Engram',
            body: engramValue,
        };
    }

	getBlock() {
		// const blockName = '';
		// const blockValue = [];

		// switch (this.lookahead!.name) {
		// 	case
		// }
		console.log(this.lookahead);
		return [];
	}

	getNewBlockTrigger() {
		const token = this.eat('NEW BLOCK TRIGGER');
        return {
            name: 'NEW BLOCK TRIGGER',
            value: token.value,
        };
	}

    getLiteral() {
        if (this.lookahead !== null) {
            switch (this.lookahead.name) {
                case 'NUMBER':
                    return this.getNumericLiteral();
                case 'STRING':
                    return this.getStringLiteral();
                default:
                    throw new SyntaxError('Literal: unexpected literal production');
            }
        }
        throw new SyntaxError('Literal: unexpected literal production');
    }

    getStringLiteral() {
        const token = this.eat('STRING');
        return {
            name: 'StringLiteral',
            value: token.value.slice(1, -1),
        };
    }

    getNumericLiteral() {
        const token = this.eat('NUMBER');
        return {
            name: 'NumericLiteral',
            value: Number(token.value),
        };
    }

    eat(tokenName: string) {
        const token = this.lookahead;
        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenName}"`,
            );
        }

        if (token.name !== tokenName) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenName}"`,
            );
        }

        this.lookahead = this.lexer.getNextToken();

        return token;
    }
}

export default Parser;
