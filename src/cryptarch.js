"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const code_generator_1 = __importDefault(require("./code-generator"));
const lexer_1 = __importDefault(require("./lexer"));
const engram_element_patterns_1 = require("./engram-element-patterns");
class Cryptarch {
    constructor() {
        this.engram = '';
        this.blocksAndTriggers = [];
        this.lexer = new lexer_1.default(); // send in blocksAndTriggers here
        this.codeGenerator = new code_generator_1.default();
        this.output = '';
    }
    decodeEngram(engram = this.engram, outputFormat = 'HTML') {
        this.engram = engram;
        console.log(outputFormat);
        if (!this.doesTitleExist()) { // processEngramIntoBlocksAndTriggers
            this.addTitleBlockToEngram();
        }
        this.splitEngramIntoBlocksAndTriggers();
        this.removeUnnecessaryTabsFromBlocksAndTriggers();
        this.codeGenerator.generateHTML(this.blocksAndTriggers);
        return this.output;
    }
    doesTitleExist() {
        if (this.engram.match(engram_element_patterns_1.TITLE_PATTERN)) {
            return true;
        }
        return false;
    }
    addTitleBlockToEngram() {
        this.engram = `\n===\n\n${this.engram}`;
    }
    splitEngramIntoBlocksAndTriggers() {
        const blocksAndTriggers = this.engram.split(engram_element_patterns_1.TRIGGER_PATTERN);
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
