import Lexer from './lexer';
import { Token } from './types';

class Parser {
    userInput: string;
    lexer: Lexer;
    lookahead: Token | null;

    constructor() {
        this.userInput = '';
        this.lexer = new Lexer();
        this.lookahead = null;
    }

    parse(input: string) {
        this.userInput = input;
        this.lexer.processUserInput(this.userInput);
        this.lookahead = this.lexer.getNextToken();
        return this.getEngram();
    }

    getEngram() {
        return {
            name: 'Engram',
            body: this.getLiteral(),
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
