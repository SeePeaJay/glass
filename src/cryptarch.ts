import CodeGenerator from './code-generator';
import Lexer from './lexer';
import {
	TITLE_PATTERN, TRIGGER_PATTERN,
} from './patterns';

class Cryptarch {
	engram: string;
	blocksAndTriggers: string[];
	lexer: Lexer;
	codeGenerator: CodeGenerator;
	output: string

	constructor() {
		this.engram = '';
		this.blocksAndTriggers = [];
		this.lexer = new Lexer(); // send in blocksAndTriggers here
		this.codeGenerator = new CodeGenerator();
		this.output = '';
	}

	setEngram(engram: string) {
		this.engram = engram;
	}

	decodeEngram(engram: string = this.engram, outputFormat: string = 'HTML') {
		this.engram = engram;
		console.log(outputFormat);

		if (this.doesTitleExist()) { // processEngramIntoBlocksAndTriggers
			this.addTitleBlockToEngram();
		}
		this.splitEngramIntoBlocksAndTriggers();
		this.removeUnnecessaryTabsFromBlocksAndTriggers();
		this.lexer.setBlocksAndTriggers(this.blocksAndTriggers);

		this.codeGenerator.generateHTML(this.blocksAndTriggers);

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
		if (this.engram.match(TITLE_PATTERN)) {
			return true;
		}
		return false;
	}

	addTitleBlockToEngram() {
		this.engram = `\n===\n\n${this.engram}`;
	}

	splitEngramIntoBlocksAndTriggers() {
		const blocksAndTriggers = this.engram.split(TRIGGER_PATTERN);
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
			} else {
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

	getUpdatedEngram() { // somehow rewrite source engram?
		return this.engram;
	}
}

export default Cryptarch;
