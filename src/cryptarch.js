"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("./lexer"));
const patterns_1 = require("./patterns");
class Cryptarch {
    constructor() {
        this.engram = '';
        this.blocksAndTriggers = [];
        this.lexer = new lexer_1.default(); // send in blocksAndTriggers here
        this.output = '';
    }
    setEngram(engram) {
        this.engram = engram;
    }
    decodeEngram(engram = this.engram, outputFormat = 'HTML') {
        this.engram = engram;
        console.log(outputFormat);
        if (this.doesTitleExist()) { // processEngramIntoBlocksAndTriggers
            this.addTitleBlockToEngram();
        }
        this.splitEngramIntoBlocksAndTriggers();
        this.removeUnnecessaryTabsFromBlocksAndTriggers();
        this.lexer.setBlocksAndTriggers(this.blocksAndTriggers);
        // currentHTMLBlockContainer - you need a variable that contains the code for current block, then add this to output once you are done with the block
        // currentEndTag = ...
        // while lexer.getNextToken is not null
        // if heading 1 markup
        // generate <h1>, or currentContainer += <h1>
        // currentEndTag = </h1>
        // if left bold markup
        // generate <b>
        // if text
        // generate ...
        // if unordered list markup
        // current container <ul><li>
        // currentEndTag = </li>
        // if block trigger
        // <close current element bracket>, or currentElement += </...>
        // output += currentElement;
        //
        // use while loop for ordered and unordered lists, I think
        return this.output;
    }
    doesTitleExist() {
        if (this.engram.match(patterns_1.TITLE_PATTERN)) {
            return true;
        }
        return false;
    }
    addTitleBlockToEngram() {
        this.engram = `\n===\n\n${this.engram}`;
    }
    splitEngramIntoBlocksAndTriggers() {
        const blocksAndTriggers = this.engram.split(patterns_1.TRIGGER_PATTERN);
        this.blocksAndTriggers.push(...blocksAndTriggers);
    }
    removeUnnecessaryTabsFromBlocksAndTriggers() {
        let maxIndentLevel = 1;
        for (let i = 1; i < this.blocksAndTriggers.length; i += 2) {
            if (this.blocksAndTriggers[i].includes('\t')) {
                const split = this.blocksAndTriggers[i].split(/(\n)(?!\n)/g);
                const tabCharacters = split[2];
                if (tabCharacters.length > maxIndentLevel) {
                    const array = [split[0], split[1], '\t'.repeat(maxIndentLevel)];
                    this.blocksAndTriggers[i] = array.join('');
                }
            }
            else {
                maxIndentLevel = 1;
            }
        }
        for (let j = 0; j < this.blocksAndTriggers.length; j += 2) {
            this.blocksAndTriggers[j] = this.blocksAndTriggers[j].replace(/\t+/g, '');
        }
    }
    decodeBlock() {
        console.log(this.engram);
    }
    getUpdatedEngram() {
        return this.engram;
    }
}
exports.default = Cryptarch;
