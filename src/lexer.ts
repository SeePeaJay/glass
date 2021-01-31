import { Token } from './types';

class Lexer {
	userInput: string;
	blocksAndTriggers: string[];
    cursor: number[];
    tokenQueue: Token[];

    constructor() {
		this.userInput = '';
		this.blocksAndTriggers = [];
        this.cursor = [0, 0];
        this.tokenQueue = [];
    }

    processUserInput(input: string) {
		this.userInput = input;
		this.splitUserInputIntoBlocksAndTriggers(this.userInput);
		this.removeUnnecessaryTabsFromBlocksAndTriggers();
		// process tabs in blocksandtriggers here
    }

    splitUserInputIntoBlocksAndTriggers(input: string) {
		const split = input.split(/(\n\n\t+|\n\n|\n\t+|(?<=\n\t+.*)\n(?!\n|\t)|(?<=\n\n)\n|^\n|\n$)/g); // split any instances of new (indented) block trigger
		this.blocksAndTriggers.push(...split);
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

    isEoF() {
        return this.cursor[1] === this.blocksAndTriggers[this.blocksAndTriggers.length - 1].length;
    }

    getNextToken() {
		if ((this.blocksAndTriggers.length === 1 && this.blocksAndTriggers[0] === '') || this.isEoF()) {
			return null;
		}

		if (this.tokenQueue.length) {
			return this.tokenQueue.shift()!;
		}

		return this.getTokenFromEngram();
    }

    getTokenFromEngram() {
		let token: Token;

		if (this.cursor[0] % 2) { // block triggers
			if (this.blocksAndTriggers[this.cursor[0]].includes('\t')) {
				token = {
					name: 'NEW INDENTED BLOCK TRIGGER',
					value: this.blocksAndTriggers[this.cursor[0]],
				};
			}
			token = {
				name: 'NEW BLOCK TRIGGER',
				value: this.blocksAndTriggers[this.cursor[0]],
			};

			this.cursor[0]++;
			this.cursor[1] = 0;

			return token;
		}

		if (this.cursor[1] === 0) { // block markups
			if (this.blocksAndTriggers[this.cursor[0]].startsWith('=1= ')) {
				token = {
					name: 'HEADING 1 MARKUP',
					value: '=1= ',
				};
				this.cursor[1] += 4;
				return token;
			}

			if (this.blocksAndTriggers[this.cursor[0]].startsWith('=2= ')) {
				token = {
					name: 'HEADING 2 MARKUP',
					value: '=2= ',
				};
				this.cursor[1] += 4;
				return token;
			}

			if (this.blocksAndTriggers[this.cursor[0]].startsWith('=3= ')) {
				token = {
					name: 'HEADING 3 MARKUP',
					value: '=3= ',
				};
				this.cursor[1] += 4;
				return token;
			}

			if (this.blocksAndTriggers[this.cursor[0]].startsWith('* ')) {
				token = {
					name: 'UNORDERED LIST MARKUP',
					value: '* ',
				};
				this.cursor[1] += 2;
				return token;
			}

			if (this.blocksAndTriggers[this.cursor[0]].match(/\d+. /)) {
				const lexeme = this.blocksAndTriggers[this.cursor[0]].match(/\d+. /)![0];
				token = {
					name: 'ORDERED LIST MARKUP',
					value: lexeme,
				};
				this.cursor[1] += lexeme.length;
				return token;
			}

			if (this.blocksAndTriggers[this.cursor[0]].startsWith('--- ')) {
				token = {
					name: 'HORIZONTAL RULE MARKUP',
					value: '--- ',
				};
				this.cursor[1] += 2;
				return token;
			}
		}

		if (this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]).match(/^image:.+{}/)) { // images
			let matchedString = '';
			[matchedString] = this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]).match(/image:.+{}/)!;
			const lexemes = matchedString.split(/(?<=image:)|(?={})/g);
			token = {
				name: 'IMAGE MARKUP 1',
				value: lexemes[0],
			};
			const remainingTokens = [
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'IMAGE MARKUP 2',
					value: lexemes[2],
				},
			];
			this.tokenQueue.push(...remainingTokens);
			this.cursor[1] += matchedString.length;
			return token;
		}

		const remainingText = this.blocksAndTriggers[this.cursor[0]].substring(this.cursor[1]);
		const remainingTokensInCurrentBlock = this.getTokensFromRemainingText(remainingText);
		token = remainingTokensInCurrentBlock.shift()!;
		this.tokenQueue.push(...remainingTokensInCurrentBlock);
		return token;
    }

    getTokensFromRemainingText(remainingText: string): Token[] {
		let lexemes;
		let tokens;
		let matchedString = '';

		if (remainingText.match(/^`@.+@`/)) {
			[matchedString] = remainingText.match(/^`@.+@`/)!;
			lexemes = matchedString.split(/(?<=`@)|(?=@`)/g);
			tokens = [
				{
					name: 'LEFT BOLD TEXT MARKUP',
					value: '`@',
				},
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'RIGHT BOLD TEXT MARKUP',
					value: '@`',
				},
			];
		} else if (remainingText.match(/^`\/.+\/`/)) {
			[matchedString] = remainingText.match(/^`\/.+\/`/)!;
			lexemes = remainingText.match(/^`\/.+\/`/)![0].split(/(?<=`\/)|(?=\/`)/g);
			tokens = [
				{
					name: 'LEFT ITALIC TEXT MARKUP',
					value: '`/',
				},
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'RIGHT ITALIC TEXT MARKUP',
					value: '/`',
				},
			];
		} else if (remainingText.match(/^`_.+_`/)) {
			[matchedString] = remainingText.match(/^`_.+_`/)!;
			lexemes = remainingText.match(/^`_.+_`/)![0].split(/(?<=`_)|(?=_`)/g);
			tokens = [
				{
					name: 'LEFT UNDERLINED TEXT MARKUP',
					value: '`_',
				},
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'RIGHT UNDERLINED TEXT MARKUP',
					value: '_`',
				},
			];
		} else if (remainingText.match(/^`=.+=`/)) {
			[matchedString] = remainingText.match(/^`=.+=`/)!;
			lexemes = remainingText.match(/^`=.+=`/)![0].split(/(?<=`=)|(?==`)/g);
			tokens = [
				{
					name: 'LEFT HIGHLIGHTED TEXT MARKUP',
					value: '`=',
				},
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'RIGHT HIGHLIGHTED TEXT MARKUP',
					value: '=`',
				},
			];
		} else if (remainingText.match(/^`-.+-`/)) {
			[matchedString] = remainingText.match(/^`-.+-`/)!;
			lexemes = remainingText.match(/^`-.+-`/)![0].split(/(?<=`-)|(?=-`)/g);
			tokens = [
				{
					name: 'LEFT STRIKETHROUGH TEXT MARKUP',
					value: '`-',
				},
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'RIGHT STRIKETHROUGH TEXT MARKUP',
					value: '-`',
				},
			];
		} else if (remainingText.match(/^`_.+_\(.+\)`/)) {
			[matchedString] = remainingText.match(/^`_.+_\(.+\)`/)!;
			const firstSplit = matchedString.split(/_\(/g);
			const secondSplit = firstSplit[0].split(/(?<=`_)/g);
			const thirdSplit = firstSplit[2].split(/(?=\)`)/g);
			lexemes = [...secondSplit, '_(', ...thirdSplit];
			tokens = [
				{
					name: 'LINK TEXT MARKUP 1',
					value: '`_',
				},
				...this.getTokensFromRemainingText(lexemes[1]),
				{
					name: 'LINK TEXT MARKUP 2',
					value: '_(',
				},
				...this.getTokensFromRemainingText(lexemes[3]),
				{
					name: 'LINK TEXT MARKUP 3',
					value: ')`',
				},
			];
		} else if (remainingText.length === 1) {
			matchedString = remainingText;
			tokens = [
				{
					name: 'NON-CONTROL CHARACTER',
					value: remainingText,
				},
			];
		} else {
			matchedString = remainingText;
			tokens = [
				{
					name: 'NON-CONTROL CHARACTERS',
					value: remainingText,
				},
			];
		}

		this.cursor[1] += matchedString.length;

		return tokens;
    }
}

export default Lexer;
