"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import fs from 'fs';
const lexer_1 = __importDefault(require("../src/lexer"));
const lexer = new lexer_1.default();
// const data = fs.readFileSync('sample5.txt', 'utf8');
// lexer.processUserInput(data.toString());
lexer.processUserInput('\n');
console.log(lexer.blocksAndTriggers);
