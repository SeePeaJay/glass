import Lexer from '../src/lexer';

describe('splitUserInputIntoBlocksAndTriggers() tests', () => {
    test('empty string input', () => {
		const lexer = new Lexer();
		const input = '';
		lexer.processUserInput(input);
		const array = [''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new block trigger (\\n)', () => {
		const lexer = new Lexer();
		const input = '\n';
		lexer.processUserInput(input);
		const array = ['', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new block trigger (\\n\\n)', () => {
		const lexer = new Lexer();
		const input = '\n\n';
		lexer.processUserInput(input);
		const array = ['', '\n\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new indented block trigger (\\n\\t)', () => {
		const lexer = new Lexer();
		const input = '\n\t';
		lexer.processUserInput(input);
		const array = ['', '\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new indented block trigger (\\n\\n\\t)', () => {
		const lexer = new Lexer();
		const input = '\n\n\t';
		lexer.processUserInput(input);
		const array = ['', '\n\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('newline character followed by paragraph', () => {
		const lexer = new Lexer();
		const input = '\nThis is a standard paragraph.';
		lexer.processUserInput(input);
		const array = ['', '\n', 'This is a standard paragraph.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('new block trigger followed by paragraph', () => {
		const lexer = new Lexer();
		const input = '\n\nThis is a standard paragraph.';
		lexer.processUserInput(input);
		const array = ['', '\n\n', 'This is a standard paragraph.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('newlines within paragraph', () => {
		const lexer = new Lexer();
		const input = 'This is a single paragraph\nwith two newlines\n.';
		lexer.processUserInput(input);
		const array = ['This is a single paragraph\nwith two newlines\n.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('\\n after indented block', () => {
		const lexer = new Lexer();
		const input = 'This is a standard paragraph.\n\n\tAnd this paragraph is indented.\nBack to normal.';
		lexer.processUserInput(input);
		const array = ['This is a standard paragraph.', '\n\n\t', 'And this paragraph is indented.', '\n', 'Back to normal.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('end with newline', () => {
		const lexer = new Lexer();
		const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n';
		lexer.processUserInput(input);
		const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('end with new block trigger', () => {
		const lexer = new Lexer();
		const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n\n';
		lexer.processUserInput(input);
		const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	describe('removeUnnecessaryTabsFromBlocksAndTriggers() tests', () => {
		test('a normally indented block', () => {
			const lexer = new Lexer();
			const input = 'This is a normal paragraph.\n\n\tAnd a normally indented paragraph.';
			lexer.processUserInput(input);
			const array = ['This is a normal paragraph.', '\n\n\t', 'And a normally indented paragraph.'];
			expect(lexer.blocksAndTriggers).toStrictEqual(array);
		});

		test('tabs within paragraph', () => {
			const lexer = new Lexer();
			const input = 'This is a normal paragraph, with one tab character 	.';
			lexer.processUserInput(input);
			const array = ['This is a normal paragraph, with one tab character .'];
			expect(lexer.blocksAndTriggers).toStrictEqual(array);
		});

		test('indented block preceded by unnecessary tabs', () => {
			const lexer = new Lexer();
			const input = 'This is a normal paragraph.\n\n\t\t\t\t\tBut this paragraph is preceded by 5 tabs';
			lexer.processUserInput(input);
			const array = ['This is a normal paragraph.', '\n\n\t', 'But this paragraph is preceded by 5 tabs'];
			expect(lexer.blocksAndTriggers).toStrictEqual(array);
		});
	});
});
