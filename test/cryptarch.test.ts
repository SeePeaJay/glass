import Cryptarch from '../src/cryptarch';

const cryptarch = new Cryptarch();

describe('does title exist tests', () => {
    test('empty engram', () => {
		const engram = '';
		cryptarch.decodeEngram(engram);
		const expected = false;
        expect(cryptarch.doesTitleExist()).toStrictEqual(expected);
	});
});

// describe('tests that verify proper separation of blocks and triggers', () => {
//     test('empty string input', () => {
// 		const input = '';
// 		lexer.processUserInput(input);
// 		const array = [''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('proper separation of new block trigger (\\n)', () => {
// 		const input = '\n';
// 		lexer.processUserInput(input);
// 		const array = ['', '\n', ''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('proper separation of new block trigger (\\n\\n)', () => {
// 		const input = '\n\n';
// 		lexer.processUserInput(input);
// 		const array = ['', '\n\n', ''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('proper separation of new indented block trigger (\\n\\t)', () => {
// 		const input = '\n\t';
// 		lexer.processUserInput(input);
// 		const array = ['', '\n\t', ''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('proper separation of new indented block trigger (\\n\\n\\t)', () => {
// 		const input = '\n\n\t';
// 		lexer.processUserInput(input);
// 		const array = ['', '\n\n\t', ''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('newline character followed by paragraph', () => {
// 		const input = '\nThis is a standard paragraph.';
// 		lexer.processUserInput(input);
// 		const array = ['', '\n', 'This is a standard paragraph.'];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('new block trigger followed by paragraph', () => {
// 		const input = '\n\nThis is a standard paragraph.';
// 		lexer.processUserInput(input);
// 		const array = ['', '\n\n', 'This is a standard paragraph.'];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('newlines within paragraph', () => {
// 		const input = 'This is a single paragraph\nwith two newlines\n.';
// 		lexer.processUserInput(input);
// 		const array = ['This is a single paragraph\nwith two newlines\n.'];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('\\n after indented block', () => {
// 		const input = 'This is a standard paragraph.\n\n\tAnd this paragraph is indented.\nBack to normal.';
// 		lexer.processUserInput(input);
// 		const array = ['This is a standard paragraph.', '\n\n\t', 'And this paragraph is indented.', '\n', 'Back to normal.'];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('end with newline', () => {
// 		const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n';
// 		lexer.processUserInput(input);
// 		const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n', ''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	test('end with new block trigger', () => {
// 		const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n\n';
// 		lexer.processUserInput(input);
// 		const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n\n', ''];
//         expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 	});

// 	describe('unnecessary tabs', () => {
// 		test('a normally indented block', () => {
// 			const input = 'This is a normal paragraph.\n\n\tAnd a normally indented paragraph.';
// 			lexer.processUserInput(input);
// 			const array = ['This is a normal paragraph.', '\n\n\t', 'And a normally indented paragraph.'];
// 			expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 		});

// 		test('tabs within paragraph', () => {
// 			const input = 'This is a normal paragraph, with one tab character 	.';
// 			lexer.processUserInput(input);
// 			const array = ['This is a normal paragraph, with one tab character .'];
// 			expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 		});

// 		test('indented block preceded by unnecessary tabs', () => {
// 			const input = 'This is a normal paragraph.\n\n\t\t\t\t\tBut this paragraph is preceded by 5 tabs';
// 			lexer.processUserInput(input);
// 			const array = ['This is a normal paragraph.', '\n\n\t', 'But this paragraph is preceded by 5 tabs'];
// 			expect(lexer.blocksAndTriggers).toStrictEqual(array);
// 		});
// 	});
// });
