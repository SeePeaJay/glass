"use strict";
// import fs from 'fs';
// import lex from '../src/parser';
// import lex from './parser.js';
// import Parser from '../src/parser';
// const input = '"42"';
// const parser = new Parser(input);
// const ast = parser.parse();
// console.log(JSON.stringify(ast, null, 2));
// fs.readFileSync('sample.txt', (data: Buffer) => {
//     console.log(data.toString());
// const tokens = lex(data.toString());
// for (let token of tokens) {
//     console.log("token name: " + token.name + "; token value: " + token.value);
// }
// });
// test('one', () => {
//     const input = '42';
//     const parser = new Parser(input);
//     const ast = parser.parse();
//     expect(ast).toStrictEqual({
//         name: 'NumericLiteral',
//         value: 42,
//     });
// });
// test('empty string', () => {
//     expect(lex('')).toStrictEqual([]);
// });
// describe('heading 1 tests', () => {
//     test('one single heading 1', () => {
//         const array = [{ name: 'HEADING 1 MARKUP', value: '=1= ' }, { name: 'TEXT', value: 'Heading 1' }];
//         expect(lex('=1= Heading 1')).toStrictEqual(array);
//     });
// });
// describe('heading 2 tests', () => {
//     test('one single heading 2', () => {
//         const array = [{ name: 'HEADING 2 MARKUP', value: '=2= ' }, { name: 'TEXT', value: 'Heading 2' }];
//         expect(lex('=2= Heading 2')).toStrictEqual(array);
//     });
// });
// describe('heading 3 tests', () => {
//     test('one single heading 3', () => {
//         const array = [{ name: 'HEADING 3 MARKUP', value: '=3= ' }, { name: 'TEXT', value: 'Heading 3' }];
//         expect(lex('=3= Heading 3')).toStrictEqual(array);
//     });
// });
// describe('unordered list tests', () => {
//     test('one single unordered list item', () => {
//         const array = [{ name: 'UNORDERED LIST MARKUP', value: '* ' }, { name: 'TEXT', value: 'Unordered list item' }];
//         expect(lex('* Unordered list item')).toStrictEqual(array);
//     });
// });
// describe('ordered list tests', () => {
//     test('one single ordered list item', () => {
//         const array = [{ name: 'ORDERED LIST MARKUP', value: '1. ' }, { name: 'TEXT', value: 'Ordered list item' }];
//         expect(lex('1. Ordered list item')).toStrictEqual(array);
//     });
// });
// describe('horizontal rule tests', () => {
//     test('one single horizontal rule', () => {
//         const array = [{ name: 'HORIZONTAL RULE MARKUP', value: '--- ' }];
//         expect(lex('--- ')).toStrictEqual(array);
//     });
// });
// describe('bold tests', () => {
//     test('one single bold text', () => {
//         const array = [{ name: 'LEFT BOLD TEXT MARKUP', value: '`@' }, { name: 'TEXT', value: 'bold' }, { name: 'RIGHT BOLD TEXT MARKUP', value: '@`' }];
//         expect(lex('`@bold@`')).toStrictEqual(array);
//     });
// });
// describe('italics tests', () => {
//     test('one single italicized text', () => {
//         const array = [{ name: 'LEFT ITALICIZED TEXT MARKUP', value: '`/' }, { name: 'TEXT', value: 'italics' }, { name: 'RIGHT ITALICIZED TEXT MARKUP', value: '/`' }];
//         expect(lex('`/italics/`')).toStrictEqual(array);
//     });
// });
// describe('underline tests', () => {
//     test('one single underline text', () => {
//         const array = [{ name: 'LEFT UNDERLINED TEXT MARKUP', value: '`_' }, { name: 'TEXT', value: 'underline' }, { name: 'RIGHT UNDERLINED TEXT MARKUP', value: '_`' }];
//         expect(lex('`_underline_`')).toStrictEqual(array);
//     });
// });
// describe('highlight tests', () => {
//     test('one single highlight text', () => {
//         const array = [{ name: 'LEFT HIGHLIGHTED TEXT MARKUP', value: '`=' }, { name: 'TEXT', value: 'highlight' }, { name: 'RIGHT HIGHLIGHTED TEXT MARKUP', value: '=`' }];
//         expect(lex('`=highlight=`')).toStrictEqual(array);
//     });
// });
// describe('strikethrough tests', () => {
//     test('one single strikethrough text', () => {
//         const array = [{ name: 'LEFT STRIKETHROUGH TEXT MARKUP', value: '`-' }, { name: 'TEXT', value: 'strikethrough' }, { name: 'RIGHT STRIKETHROUGH TEXT MARKUP', value: '-`' }];
//         expect(lex('`-strikethrough-`')).toStrictEqual(array);
//     });
// });
// describe('link tests', () => {
//     test('one single link text', () => {
//         const array = [{ name: 'LINK TEXT MARKUP 1', value: '`_' }, { name: 'LINK ALIAS', value: 'link alias' }, { name: 'LINK TEXT MARKUP 2', value: '_(' }, { name: 'LINK URL', value: 'www.example.com' }, { name: 'LINK TEXT MARKUP 3', value: ')`' }];
//         expect(lex('`_link alias_(www.example.com)`')).toStrictEqual(array);
//     });
// });
// describe('image tests', () => {
//     test('one single image', () => {
//         const array = [{ name: 'IMAGE MARKUP 1', value: 'image:' }, { name: 'IMAGE PATH', value: 'path_to_image.png' }, { name: 'IMAGE MARKUP 2', value: '{}' }];
//         expect(lex('image:path_to_image.png{}')).toStrictEqual(array);
//     });
// });
// describe('newline tests', () => {
//     test('one single newline with text', () => {
//         const array = [{ name: 'TEXT', value: 'A paragraph ...' }, { name: 'NEWLINE', value: '\n' }, { name: 'TEXT', value: 'And another.' }];
//         expect(lex('A paragraph ...\nAnd another.')).toStrictEqual(array);
//     });
// });
// describe('indent tests', () => {
//     test('one single indent with text', () => {
//         const array = [{ name: 'TEXT', value: 'A paragraph with an indent: ' }, { name: 'INDENT', value: '\t' }, { name: 'TEXT', value: '.' }];
//         expect(lex('A paragraph with an indent: \t.')).toStrictEqual(array);
//     });
// });
