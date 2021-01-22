// import fs from 'fs';
import Lexer from '../src/lexer';

const lexer = new Lexer();

// const data = fs.readFileSync('sample5.txt', 'utf8');
// lexer.processUserInput(data.toString());
lexer.processUserInput('\n');
console.log(lexer.blocksAndTriggers);
