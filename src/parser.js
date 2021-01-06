"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("./lexer"));
class Parser {
    constructor() {
        this.input = '';
        this.lexer = new lexer_1.default(this.input);
    }
    parse(input) {
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
