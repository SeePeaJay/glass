import fs from 'fs';
import Lexer from '../src/lexer';

const lexer = new Lexer();

// describe('splitUserInputIntoBlocksAndTriggers tests', () => {
//     test('function on sample.txt', () => {
//         const array = [{ name: 'HEADING 1 MARKUP', value: '=1= ' }, { name: 'TEXT', value: 'Heading 1' }];
//         expect(lex('=1= Heading 1')).toStrictEqual(array);
//     });
// });

const data = fs.readFileSync('sample.txt', 'utf8');
lexer.processUserInput(data.toString());
console.log(lexer.blocksAndTriggers);
