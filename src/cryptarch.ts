import CodeGenerator from './code-generator';
import Lexer from './lexer';
import { PATTERNS } from './constants';

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

	decodeEngram(engram: string = this.engram, outputFormat: string = 'HTML') {
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
		if (this.engram.match(PATTERNS.TITLE)) {
			return true;
		}
		return false;
	}

	addTitleBlockToEngram() {
		this.engram = `\n===\n\n${this.engram}`;
	}

	splitEngramIntoBlocksAndTriggers() {
		const blocksAndTriggers = this.engram.split(PATTERNS.NEW_BLOCK_TRIGGER);
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
