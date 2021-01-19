import { Token } from './types';

class Lexer {
    BLOCK_ELEMENTS_PATTERN = '^(=1= |=2= |=3= |\\* |\\d+\\. |--- |image:.+{})';

    input: string;
    cursor: number;
    lastCursorPosition: number;
    isAtStartofBlock: boolean;
    currentIndentLevel: number;
    maxIndentLevel: number;
    isLastBlockIndented: boolean;
    tokenQueue: Token[];
    lastTokenCreated: Token | null;

    constructor() {
        this.input = '';
        this.cursor = 0;
        this.lastCursorPosition = 0;
        this.isAtStartofBlock = true;
        this.currentIndentLevel = 0;
        this.maxIndentLevel = 0;
        this.isLastBlockIndented = false;
        this.tokenQueue = [];
        this.lastTokenCreated = null;
    }

    setInput(input: string) {
        this.input = input;
    }

    isEoF() {
        return this.cursor === this.input.length;
    }

    hasMoreTokens() {
        return this.cursor < this.input.length;
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
            return this.tokenQueue.shift();
        }

        if (this.input.substring(this.cursor).match('^\\n\\n(?!\\t+)') || (this.isLastBlockIndented && this.input.substring(this.cursor).match('^\\n(?!(\\n|\\t)+)'))) {
            let newBlockTriggerToken: Token;

            this.lastCursorPosition = this.cursor;
            if (this.input.substring(this.cursor).startsWith('\n\n')) {
                this.cursor += 2;
                newBlockTriggerToken = {
                    name: 'NEW BLOCK TRIGGER',
                    value: '\\n\\n',
                };
            } else {
                this.cursor++;
                newBlockTriggerToken = {
                    name: 'NEW BLOCK TRIGGER',
                    value: '\\n',
                };
            }
            this.isAtStartofBlock = true;
            this.currentIndentLevel = 0;
            this.maxIndentLevel = 1;
            this.isLastBlockIndented = false;

            if (this.lastCursorPosition === 0) {
                this.tokenQueue.push(newBlockTriggerToken);

                const blankLineToken = {
                    name: 'BLANK LINE',
                    value: '',
                };
                this.lastTokenCreated = blankLineToken;
                return blankLineToken;
            }
            this.lastTokenCreated = newBlockTriggerToken;
            return newBlockTriggerToken;
        }

        if (this.input.substring(this.cursor).startsWith('\n\n\t') || this.input.substring(this.cursor).startsWith('\n\t')) {
            let newIndentedBlockTriggerToken: Token;

            this.lastCursorPosition = this.cursor;
            if (this.input.substring(this.cursor).startsWith('\n\n\t')) {
                this.cursor += 3;
                newIndentedBlockTriggerToken = {
                    name: 'NEW INDENTED BLOCK TRIGGER',
                    value: '\\n\\n\\t',
                };
            } else {
                this.cursor += 2;
                newIndentedBlockTriggerToken = {
                    name: 'NEW INDENTED BLOCK TRIGGER',
                    value: '\\n\\t',
                };
            }
            this.isAtStartofBlock = true;
            this.currentIndentLevel = 1;
            while (this.input.substring(this.cursor).startsWith('\t')) {
                this.cursor++;
                if (this.currentIndentLevel <= this.maxIndentLevel) {
                    this.currentIndentLevel++;
                    newIndentedBlockTriggerToken.value += '\\t';
                }
            }
            this.maxIndentLevel = this.currentIndentLevel + 1;
            this.isLastBlockIndented = true;

            if (this.lastCursorPosition === 0) {
                this.tokenQueue.push(newIndentedBlockTriggerToken);

                const blankLineToken = {
                    name: 'BLANK LINE',
                    value: '',
                };
                this.lastTokenCreated = blankLineToken;
                return blankLineToken;
            }
            this.lastTokenCreated = newIndentedBlockTriggerToken;
            return newIndentedBlockTriggerToken;
        }

        return this.getTokensFromText();
    }

    getTokensFromText() {
        this.input = '';
        return [];
    }
}

export default Lexer;
