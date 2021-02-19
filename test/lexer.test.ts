import Lexer from '../src/lexer';
import { Token } from '../src/types';

const lexer = new Lexer();

describe('tests that verify proper separation of blocks and triggers', () => {
    test('empty string input', () => {
		const input = '';
		lexer.processUserInput(input);
		const array = [''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new block trigger (\\n)', () => {
		const input = '\n';
		lexer.processUserInput(input);
		const array = ['', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new block trigger (\\n\\n)', () => {
		const input = '\n\n';
		lexer.processUserInput(input);
		const array = ['', '\n\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new indented block trigger (\\n\\t)', () => {
		const input = '\n\t';
		lexer.processUserInput(input);
		const array = ['', '\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('proper separation of new indented block trigger (\\n\\n\\t)', () => {
		const input = '\n\n\t';
		lexer.processUserInput(input);
		const array = ['', '\n\n\t', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('newline character followed by paragraph', () => {
		const input = '\nThis is a standard paragraph.';
		lexer.processUserInput(input);
		const array = ['', '\n', 'This is a standard paragraph.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('new block trigger followed by paragraph', () => {
		const input = '\n\nThis is a standard paragraph.';
		lexer.processUserInput(input);
		const array = ['', '\n\n', 'This is a standard paragraph.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('newlines within paragraph', () => {
		const input = 'This is a single paragraph\nwith two newlines\n.';
		lexer.processUserInput(input);
		const array = ['This is a single paragraph\nwith two newlines\n.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('\\n after indented block', () => {
		const input = 'This is a standard paragraph.\n\n\tAnd this paragraph is indented.\nBack to normal.';
		lexer.processUserInput(input);
		const array = ['This is a standard paragraph.', '\n\n\t', 'And this paragraph is indented.', '\n', 'Back to normal.'];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('end with newline', () => {
		const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n';
		lexer.processUserInput(input);
		const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	test('end with new block trigger', () => {
		const input = 'This is a standard paragraph.\n\nThis is another paragraph.\n\nOne final paragraph.\n\n';
		lexer.processUserInput(input);
		const array = ['This is a standard paragraph.', '\n\n', 'This is another paragraph.', '\n\n', 'One final paragraph.', '\n\n', ''];
        expect(lexer.blocksAndTriggers).toStrictEqual(array);
	});

	describe('unnecessary tabs', () => {
		test('a normally indented block', () => {
			const input = 'This is a normal paragraph.\n\n\tAnd a normally indented paragraph.';
			lexer.processUserInput(input);
			const array = ['This is a normal paragraph.', '\n\n\t', 'And a normally indented paragraph.'];
			expect(lexer.blocksAndTriggers).toStrictEqual(array);
		});

		test('tabs within paragraph', () => {
			const input = 'This is a normal paragraph, with one tab character 	.';
			lexer.processUserInput(input);
			const array = ['This is a normal paragraph, with one tab character .'];
			expect(lexer.blocksAndTriggers).toStrictEqual(array);
		});

		test('indented block preceded by unnecessary tabs', () => {
			const input = 'This is a normal paragraph.\n\n\t\t\t\t\tBut this paragraph is preceded by 5 tabs';
			lexer.processUserInput(input);
			const array = ['This is a normal paragraph.', '\n\n\t', 'But this paragraph is preceded by 5 tabs'];
			expect(lexer.blocksAndTriggers).toStrictEqual(array);
		});
	});
});

describe('tests that verify token production', () => {
	test('empty string input', () => {
		const input = '';
		const receivedTokens: Token[] = [];
		lexer.processUserInput(input);
		while (lexer.getNextToken()) {
			receivedTokens.push(lexer.getNextToken()!);
		}
		const expectedTokens: Token[] = [];
		expect(receivedTokens).toStrictEqual(expectedTokens);
	});

	describe('single block', () => {
		test('a single paragraph block', () => {
			const input = 'This is a paragraph.';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'TEXT',
					value: 'This is a paragraph.',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single newline within a paragraph block', () => {
			const input = 'This is a \n paragraph.';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'TEXT',
					value: 'This is a \n paragraph.',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single heading 1 block', () => {
			const input = '=1= Heading 1';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HEADING 1 MARKUP',
					value: '=1= ',
				},
				{
					name: 'TEXT',
					value: 'Heading 1',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single heading 2 block', () => {
			const input = '=2= Heading 2';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HEADING 2 MARKUP',
					value: '=2= ',
				},
				{
					name: 'TEXT',
					value: 'Heading 2',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single heading 3 block', () => {
			const input = '=3= Heading 3';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HEADING 3 MARKUP',
					value: '=3= ',
				},
				{
					name: 'TEXT',
					value: 'Heading 3',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single unordered list block', () => {
			const input = '* list';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'UNORDERED LIST MARKUP',
					value: '* ',
				},
				{
					name: 'TEXT',
					value: 'list',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single ordered list block', () => {
			const input = '12. list';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'ORDERED LIST MARKUP',
					value: '12. ',
				},
				{
					name: 'TEXT',
					value: 'list',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single horizontal rule block', () => {
			const input = '--- ';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HORIZONTAL RULE MARKUP',
					value: '--- ',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single image text', () => {
			const input = 'image:path.jpg{}';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'IMAGE MARKUP 1',
					value: 'image:',
				},
				{
					name: 'IMAGE PATH',
					value: 'path.jpg',
				},
				{
					name: 'IMAGE MARKUP 2',
					value: '{}',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single bold text', () => {
			const input = '`@bold text@`';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'LEFT BOLD TEXT MARKUP',
					value: '`@',
				},
				{
					name: 'TEXT',
					value: 'bold text',
				},
				{
					name: 'RIGHT BOLD TEXT MARKUP',
					value: '@`',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single italic text', () => {
			const input = '`/italic text/`';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'LEFT ITALIC TEXT MARKUP',
					value: '`/',
				},
				{
					name: 'TEXT',
					value: 'italic text',
				},
				{
					name: 'RIGHT ITALIC TEXT MARKUP',
					value: '/`',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single underlined text', () => {
			const input = '`_underlined text_`';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'LEFT UNDERLINED TEXT MARKUP',
					value: '`_',
				},
				{
					name: 'TEXT',
					value: 'underlined text',
				},
				{
					name: 'RIGHT UNDERLINED TEXT MARKUP',
					value: '_`',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single highlighted text', () => {
			const input = '`=highlighted text=`';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'LEFT HIGHLIGHTED TEXT MARKUP',
					value: '`=',
				},
				{
					name: 'TEXT',
					value: 'highlighted text',
				},
				{
					name: 'RIGHT HIGHLIGHTED TEXT MARKUP',
					value: '=`',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single strikethrough text', () => {
			const input = '`-strikethrough text-`';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'LEFT STRIKETHROUGH TEXT MARKUP',
					value: '`-',
				},
				{
					name: 'TEXT',
					value: 'strikethrough text',
				},
				{
					name: 'RIGHT STRIKETHROUGH TEXT MARKUP',
					value: '-`',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('a single link text', () => {
			const input = '`_link alias_(www.example.com)`';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'LINK TEXT MARKUP 1',
					value: '`_',
				},
				{
					name: 'TEXT',
					value: 'link alias',
				},
				{
					name: 'LINK TEXT MARKUP 2',
					value: '_(',
				},
				{
					name: 'LINK URL',
					value: 'www.example.com',
				},
				{
					name: 'LINK TEXT MARKUP 3',
					value: ')`',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('conjoined styles', () => {
			const input = 'A paragraph that has both `@bold@` and `/italic/` text.';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'TEXT',
					value: 'A paragraph that has both ',
				},
				{
					name: 'LEFT BOLD TEXT MARKUP',
					value: '`@',
				},
				{
					name: 'TEXT',
					value: 'bold',
				},
				{
					name: 'RIGHT BOLD TEXT MARKUP',
					value: '@`',
				},
				{
					name: 'TEXT',
					value: ' and ',
				},
				{
					name: 'LEFT ITALIC TEXT MARKUP',
					value: '`/',
				},
				{
					name: 'TEXT',
					value: 'italic',
				},
				{
					name: 'RIGHT ITALIC TEXT MARKUP',
					value: '/`',
				},
				{
					name: 'TEXT',
					value: ' text.',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		describe('nested styles', () => {
			test('same styles should not be nested (currently)', () => {
				const input = '`@Same styles cannot be `@nested@` currently.@`';
				const receivedTokens: Token[] = [];
				lexer.processUserInput(input);
				let token = lexer.getNextToken();
				while (token) {
					receivedTokens.push(token!);
					token = lexer.getNextToken();
				}
				const expectedTokens: Token[] = [
					{
						name: 'LEFT BOLD TEXT MARKUP',
						value: '`@',
					},
					{
						name: 'TEXT',
						value: 'Same styles cannot be `@nested',
					},
					{
						name: 'RIGHT BOLD TEXT MARKUP',
						value: '@`',
					},
					{
						name: 'TEXT',
						value: ' currently.@`',
					},
				];
				expect(receivedTokens).toStrictEqual(expectedTokens);
			});

			test('different styles should be nested', () => {
				const input = '`@Different styles should be `/nested/`.@`';
				const receivedTokens: Token[] = [];
				lexer.processUserInput(input);
				let token = lexer.getNextToken();
				while (token) {
					receivedTokens.push(token!);
					token = lexer.getNextToken();
				}
				const expectedTokens: Token[] = [
					{
						name: 'LEFT BOLD TEXT MARKUP',
						value: '`@',
					},
					{
						name: 'TEXT',
						value: 'Different styles should be ',
					},
					{
						name: 'LEFT ITALIC TEXT MARKUP',
						value: '`/',
					},
					{
						name: 'TEXT',
						value: 'nested',
					},
					{
						name: 'RIGHT ITALIC TEXT MARKUP',
						value: '/`',
					},
					{
						name: 'TEXT',
						value: '.',
					},
					{
						name: 'RIGHT BOLD TEXT MARKUP',
						value: '@`',
					},
				];
				expect(receivedTokens).toStrictEqual(expectedTokens);
			});
		});
	});

	describe('multiple blocks', () => {
		test('proper separation of \\n\\n', () => {
			const input = '=1= A heading\n\nA standard paragraph.';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HEADING 1 MARKUP',
					value: '=1= ',
				},
				{
					name: 'TEXT',
					value: 'A heading',
				},
				{
					name: 'NEW BLOCK TRIGGER',
					value: '\n\n',
				},
				{
					name: 'TEXT',
					value: 'A standard paragraph.',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('proper separation of \\n\\n\\t', () => {
			const input = '=1= A heading\n\n\tAn indented paragraph.';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HEADING 1 MARKUP',
					value: '=1= ',
				},
				{
					name: 'TEXT',
					value: 'A heading',
				},
				{
					name: 'NEW INDENTED BLOCK TRIGGER',
					value: '\n\n\t',
				},
				{
					name: 'TEXT',
					value: 'An indented paragraph.',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('proper separation of \\n\\t', () => {
			const input = '=1= A heading\n\tAn indented paragraph.';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'HEADING 1 MARKUP',
					value: '=1= ',
				},
				{
					name: 'TEXT',
					value: 'A heading',
				},
				{
					name: 'NEW INDENTED BLOCK TRIGGER',
					value: '\n\t',
				},
				{
					name: 'TEXT',
					value: 'An indented paragraph.',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('two empty blocks separated by \\n\\n', () => {
			const input = '\n\n';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
				{
					name: 'BLANK LINE',
					value: '',
				},
				{
					name: 'NEW BLOCK TRIGGER',
					value: '\n\n',
				},
				{
					name: 'BLANK LINE',
					value: '',
				},
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});

		test('paragraph with newlines at both ends', () => {
			const input = '\nok hello there\n\n\nA new hope?!';
			const receivedTokens: Token[] = [];
			lexer.processUserInput(input);
			let token = lexer.getNextToken();
			while (token) {
				receivedTokens.push(token!);
				token = lexer.getNextToken();
			}
			const expectedTokens: Token[] = [
			];
			expect(receivedTokens).toStrictEqual(expectedTokens);
		});
	});
});
