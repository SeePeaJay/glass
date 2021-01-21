"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const lexer_1 = __importDefault(require("../src/lexer"));
const lexer = new lexer_1.default();
// describe('splitUserInputIntoBlocksAndTriggers tests', () => {
//     test('function on sample.txt', () => {
//         const array = [{ name: 'HEADING 1 MARKUP', value: '=1= ' }, { name: 'TEXT', value: 'Heading 1' }];
//         expect(lex('=1= Heading 1')).toStrictEqual(array);
//     });
// });
const data = fs_1.default.readFileSync('sample.txt', 'utf8');
lexer.processUserInput(data.toString());
console.log(lexer.blocksAndTriggers);
