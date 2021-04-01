// import ENGRAM_BLOCK_TYPE from './engram-block-types';
import Lexer from './lexer';
// import { HEADING_1_MARKUP_TOKEN, HEADING_2_MARKUP_TOKEN, HEADING_3_MARKUP_TOKEN, UNORDERED_LIST_MARKUP_TOKEN } from './markup-tokens';
import { Token } from './types';

class CodeGenerator {
	output: string;
	lexer: Lexer;

	constructor() {
		this.output = '';
		this.lexer = new Lexer();
	}

	generateHTML(blocksAndTriggers: string[]) {
		let currentToken: Token | null;
		let nextToken: Token | null;
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

export default CodeGenerator;
