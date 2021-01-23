"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("../src/lexer"));
describe('splitUserInputIntoBlocksAndTriggers tests', () => {
    test('empty string input', () => {
        const lexer = new lexer_1.default();
        const input = '';
        lexer.processUserInput(input);
        const array = [''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('proper separation of new block trigger (\\n)', () => {
        const lexer = new lexer_1.default();
        const input = '\n';
        lexer.processUserInput(input);
        const array = ['', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('proper separation of new block trigger (\\n\\n)', () => {
        const lexer = new lexer_1.default();
        const input = '\n\n';
        lexer.processUserInput(input);
        const array = ['', '\n\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('proper separation of new indented block trigger (\\n\\t)', () => {
        const lexer = new lexer_1.default();
        const input = '\n\t';
        lexer.processUserInput(input);
        const array = ['', '\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('proper separation of new indented block trigger (\\n\\n\\t)', () => {
        const lexer = new lexer_1.default();
        const input = '\n\n\t';
        lexer.processUserInput(input);
        const array = ['', '\n\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('newline character followed by paragraph', () => {
        const lexer = new lexer_1.default();
        const input = '\nThis is a standard paragraph.';
        lexer.processUserInput(input);
        const array = ['\nThis is a standard paragraph.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('\\n after indented block', () => {
        const lexer = new lexer_1.default();
        const input = 'This is a standard paragraph.\n\n\tAnd this paragraph is indented.\nBack to normal.';
        lexer.processUserInput(input);
        const array = ['This is a standard paragraph.', '\n\n\t', 'And this paragraph is indented.', '\n', 'Back to normal.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('end with newline', () => {
        const lexer = new lexer_1.default();
        const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n';
        lexer.processUserInput(input);
        const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('newlines within paragraph', () => {
        const lexer = new lexer_1.default();
        const input = 'This is a single paragraph\nwith two newlines\n.';
        lexer.processUserInput(input);
        const array = ['This is a single paragraph\nwith two newlines\n.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
    test('tabs within paragraph', () => {
        const lexer = new lexer_1.default();
        const input = 'This is a normal paragraph, with one tab character 	.';
        lexer.processUserInput(input);
        const array = ['This is a normal paragraph, with one tab character .'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
});
