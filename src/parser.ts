import Lexer from './lexer';

type Token = {
    name: string,
    value: string,
};

class Parser {
    input: string;
    lexer: Lexer;
    lookahead?: Token | null;

    constructor() {
        this.input = '';
        this.lexer = new Lexer(this.input);
    }

    parse(input: string) {
        this.input = input;
        this.lookahead = this.lexer.getNextToken();

        return this.getEngram();
    }

    getEngram() {
        return {
            name: 'Engram',
            body: this.getNumericLiteral(),
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
