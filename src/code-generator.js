"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import ENGRAM_BLOCK_TYPE from './engram-block-types';
const lexer_1 = __importDefault(require("./lexer"));
class CodeGenerator {
    constructor() {
        this.output = '';
        this.lexer = new lexer_1.default();
    }
    generateHTML(blocksAndTriggers) {
        let currentToken;
        let nextToken;
        // let currentEngramBlockType: ENGRAM_BLOCK_TYPE = ENGRAM_BLOCK_TYPE.NONE;
        // let currentEngramBlockIndentLevel = 0;
        // let currentHTMLToBeAdded = '';
        this.lexer.processBlocksAndTriggers(blocksAndTriggers);
        currentToken = this.lexer.getNextToken();
        nextToken = this.lexer.getNextToken();
        while (currentToken) {
            // currentEngramBlockType = ENGRAM_BLOCK_TYPE.HEADING_1;
            // if (currentEngramBlockType === ENGRAM_BLOCK_TYPE.HEADING_1 || currentToken.name === ENGRAM_BLOCK_TYPES.HEADING_2 || currentToken.name === ENGRAM_BLOCK_TYPES.HEADING_3 || currentToken.name === UENGRAM_BLOCK_TYPES.UNORDERED_LIST || currentToken.name === 'Uno')
            currentToken = nextToken;
            nextToken = this.lexer.getNextToken();
        }
    }
}
exports.default = CodeGenerator;
