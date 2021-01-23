import { Token } from './types';

class Lexer {
    BLOCK_MARKUPS_PATTERN = '^(=1= |=2= |=3= |\\* |\\d+\\. |--- )';

    userInput: string;
    cursor: number;
    lastCursorPosition: number;
    isAtStartofBlock: boolean;
    currentIndentLevel: number;
    maxIndentLevel: number;
    // isLastBlockIndented: boolean;
    tokenQueue: Token[];
    lastTokenCreated: Token | null;

    blocksAndTriggers: string[];

    constructor() {
        this.userInput = '';
        this.cursor = 0;
        this.lastCursorPosition = 0;
        this.isAtStartofBlock = true;
        this.currentIndentLevel = 0;
        this.maxIndentLevel = 0;
        // this.isLastBlockIndented = false;
        this.tokenQueue = [];
        this.lastTokenCreated = null;

        this.blocksAndTriggers = [];
    }

    processUserInput(input: string) {
        this.userInput = input;
		this.splitUserInputIntoBlocksAndTriggers(this.userInput);
		this.removeUnnecessaryTabsFromBlocksAndTriggers();
    }

    // splitUserInputIntoBlocks?
    splitUserInputIntoBlocksAndTriggers(input: string) {
		if (input.match(/^(\n\n|\n\n\t+|\n|\n\t+)$/g)) {
			this.blocksAndTriggers.push('', input, '');
		} else {
			const firstSplit = input.split(/(?<=\n\t+.*)(\n)(?!\n|\t)/g);
			for (let i = 0; i < firstSplit.length; i += 2) {
				const secondSplit = firstSplit[i].split(/(\n\n\t+|\n\n|\n\t+)/g);
				this.blocksAndTriggers.push(...secondSplit);
				if (i + 1 < firstSplit.length) {
					this.blocksAndTriggers.push(firstSplit[i + 1]);
				}
			}
		}
	}

	removeUnnecessaryTabsFromBlocksAndTriggers() {
		for (let i = 0; i < this.blocksAndTriggers.length; i += 2) {
			this.blocksAndTriggers[i] = this.blocksAndTriggers[i].replace(/\t+/g, '');
		}
	}

    isEoF() {
        return this.cursor === this.userInput.length;
    }

    hasMoreTokens() {
        return this.cursor < this.userInput.length;
    }

    getNextToken() {
        if (this.isEoF()) {
            if (this.lastTokenCreated === null || !['NEWLINE', 'NEW BLOCK TRIGGER', 'NEW INDENTED BLOCK TRIGGER'].includes(this.lastTokenCreated.name)) {
                return null;
            }

            return {
                name: 'BLANK LINE',
                value: '',
            };
        }

        if (this.tokenQueue.length) {
            return this.tokenQueue.shift()!;
        }

        return {
                name: 'BLANK LINE',
                value: '',
        };

        // return this.getTokenFromEngram();

        // if (this.input.substring(this.cursor).startsWith('\n\n\t') || this.input.substring(this.cursor).startsWith('\n\t')) {
        //     let newIndentedBlockTriggerToken: Token;

        //     this.lastCursorPosition = this.cursor;
        //     if (this.input.substring(this.cursor).startsWith('\n\n\t')) {
        //         this.cursor += 3;
        //         newIndentedBlockTriggerToken = {
        //             name: 'NEW INDENTED BLOCK TRIGGER',
        //             value: '\\n\\n\\t',
        //         };
        //     } else {
        //         this.cursor += 2;
        //         newIndentedBlockTriggerToken = {
        //             name: 'NEW INDENTED BLOCK TRIGGER',
        //             value: '\\n\\t',
        //         };
        //     }
        //     this.isAtStartofBlock = true;
        //     this.currentIndentLevel = 1;
        //     while (this.input.substring(this.cursor).startsWith('\t')) {
        //         this.cursor++;
        //         if (this.currentIndentLevel <= this.maxIndentLevel) {
        //             this.currentIndentLevel++;
        //             newIndentedBlockTriggerToken.value += '\\t';
        //         }
        //     }
        //     this.maxIndentLevel = this.currentIndentLevel + 1;
        //     this.isLastBlockIndented = true;

        //     if (this.lastCursorPosition === 0) {
        //         this.tokenQueue.push(newIndentedBlockTriggerToken);

        //         const blankLineToken = {
        //             name: 'BLANK LINE',
        //             value: '',
        //         };
        //         this.lastTokenCreated = blankLineToken;
        //         return blankLineToken;
        //     }
        //     this.lastTokenCreated = newIndentedBlockTriggerToken;
        //     return newIndentedBlockTriggerToken;
        // }

        // if (this.input.substring(this.cursor).startsWith('\n\n') || (this.isLastBlockIndented && this.input.substring(this.cursor).startsWith('\n'))) {
        //     let newBlockTriggerToken: Token;

        //     this.lastCursorPosition = this.cursor;
        //     if (this.input.substring(this.cursor).startsWith('\n\n')) {
        //         this.cursor += 2;
        //         newBlockTriggerToken = {
        //             name: 'NEW BLOCK TRIGGER',
        //             value: '\\n\\n',
        //         };
        //     } else {
        //         this.cursor++;
        //         newBlockTriggerToken = {
        //             name: 'NEW BLOCK TRIGGER',
        //             value: '\\n',
        //         };
        //     }
        //     this.isAtStartofBlock = true;
        //     this.currentIndentLevel = 0;
        //     this.maxIndentLevel = 1;
        //     this.isLastBlockIndented = false;

        //     if (this.lastCursorPosition === 0) {
        //         this.tokenQueue.push(newBlockTriggerToken);

        //         const blankLineToken = {
        //             name: 'BLANK LINE',
        //             value: '',
        //         };
        //         this.lastTokenCreated = blankLineToken;
        //         return blankLineToken;
        //     }
        //     this.lastTokenCreated = newBlockTriggerToken;
        //     return newBlockTriggerToken;
        // }

        // // getBlockMarkupToken?
        // if (this.isAtStartofBlock && this.input.substring(this.cursor).match(this.BLOCK_MARKUPS_PATTERN)) {
        //     let blockMarkupToken: Token;

        //     this.lastCursorPosition = this.cursor;
        //     if (this.input.startsWith('=1= ')) {
        //         this.cursor += 4;
        //         blockMarkupToken = {
        //             name: 'HEADING 1 MARKUP',
        //             value: '=1= ',
        //         };
        //     } else if (this.input.startsWith('=2= ')) {
        //         this.cursor += 4;
        //         blockMarkupToken = {
        //             name: 'HEADING 2 MARKUP',
        //             value: '=2= ',
        //         };
        //     } else if (this.input.startsWith('=3= ')) {
        //         this.cursor += 4;
        //         blockMarkupToken = {
        //             name: 'HEADING 3 MARKUP',
        //             value: '=3= ',
        //         };
        //     } else if (this.input.startsWith('* ')) {
        //         this.cursor += 2;
        //         blockMarkupToken = {
        //             name: 'UNORDERED LIST MARKUP',
        //             value: '* ',
        //         };
        //     } else if (this.input.match('^\\d+.')) {
        //         const lexeme = this.input.match('^\\d+.')![0];
        //         this.cursor += lexeme.length;
        //         blockMarkupToken = {
        //             name: 'ORDERED LIST MARKUP',
        //             value: lexeme,
        //         };
        //     } else {
        //         this.cursor += 4;
        //         blockMarkupToken = {
        //             name: 'HORIZONTAL RULE MARKUP',
        //             value: '--- ',
        //         };
        //     }
        //     this.isAtStartofBlock = false;

        //     return blockMarkupToken;
        // }
    }

    getTokenFromEngram() {
        this.userInput = '';
        return this.getTokenFromText();
    }

    getTokenFromText() {
        this.userInput = '';
        return [];
    }
}

export default Lexer;
