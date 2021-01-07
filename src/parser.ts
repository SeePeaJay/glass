import Lexer from './lexer';

type Token = {
    name: string,
    value: string,
};

class Parser {
    input: string;
    lexer: Lexer;
    lookahead: Token | null;

    constructor(input: string) {
        this.input = input;
        this.lexer = new Lexer(this.input);
        this.lookahead = this.lexer.getNextToken();
    }

    parse() {
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
