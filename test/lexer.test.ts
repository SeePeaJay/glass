import Lexer from '../src/lexer';

describe('splitUserInputIntoBlocksAndTriggers tests', () => {
    test('function with empty string input', () => {
		const lexer = new Lexer();
		const input = '';
		lexer.processUserInput(input);
		const array = [''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('function with input = a single new block trigger (\\n) only', () => {
		const lexer = new Lexer();
		const input = '\n';
		lexer.processUserInput(input);
		const array = ['', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('function with input = a single new block trigger (\\n\\n) only', () => {
		const lexer = new Lexer();
		const input = '\n\n';
		lexer.processUserInput(input);
		const array = ['', '\n\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('function with input = a single new indented block trigger (\\n\\t) only', () => {
		const lexer = new Lexer();
		const input = '\n\t';
		lexer.processUserInput(input);
		const array = ['', '\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('function with input = a single new indented block trigger (\\n\\n\\t) only', () => {
		const lexer = new Lexer();
		const input = '\n\n\t';
		lexer.processUserInput(input);
		const array = ['', '\n\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
    });
});
