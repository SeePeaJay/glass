"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("../src/lexer"));
describe('splitUserInputIntoBlocksAndTriggers tests', () => {
    test('function on empty string', () => {
        const lexer = new lexer_1.default();
        const input = '';
        lexer.processUserInput(input);
        const array = [''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('function on single newline', () => {
        const lexer = new lexer_1.default();
        const input = '\n';
        lexer.processUserInput(input);
        const array = ['', '\n', ''];
        console.log(lexer.blocksAndTriggers);
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('function on single new block trigger', () => {
        const lexer = new lexer_1.default();
        const input = '\n\n';
        lexer.processUserInput(input);
        const array = ['', '\n\n', ''];
        console.log(lexer.blocksAndTriggers);
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
});
