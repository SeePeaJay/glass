"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("./lexer"));
class Parser {
    constructor() {
        this.userInput = '';
        this.lexer = new lexer_1.default();
        this.lookahead = null;
    }
    parse(input) {
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
