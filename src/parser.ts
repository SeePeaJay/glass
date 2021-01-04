const HEADING_1_PATTERN = '^=1= |(?<=\\n|\\t)=1= ';
const HEADING_2_PATTERN = '^=2= |(?<=\\n|\\t)=2= ';
const HEADING_3_PATTERN = '^=3= |(?<=\\n|\\t)=3= ';
const UNORDERED_LIST_PATTERN = '^\\* |(?<=\\n|\\t)\\* ';
const ORDERED_LIST_PATTERN = '^\\d+\\. |(?<=\\n|\\t)\\d+\\. ';
const HORIZONTAL_RULE_PATTERN = '^--- |(?<=\\n|\\t)--- ';
const BOLD_TEXT_PATTERN = '`@.+@`';
const ITALICIZED_TEXT_PATTERN = '`\/.+\/`';
const UNDERLINED_TEXT_PATTERN = '`_.+_`';
const HIGHLIGHTED_TEXT_PATTERN = '`=.+=`';
const STRIKETHROUGH_TEXT_PATTERN = '`-.+-`';
const LINK_TEXT_PATTERN = '`_.+_\\(.+\\)`';
const IMAGE_PATTERN = 'image:.+{}';
const NEWLINE_PATTERN = '\\n';
const INDENT_PATTERN = '\\t';

const PATTERNS = [HEADING_1_PATTERN, HEADING_2_PATTERN, HEADING_3_PATTERN, UNORDERED_LIST_PATTERN, ORDERED_LIST_PATTERN, HORIZONTAL_RULE_PATTERN, BOLD_TEXT_PATTERN, ITALICIZED_TEXT_PATTERN, UNDERLINED_TEXT_PATTERN, HIGHLIGHTED_TEXT_PATTERN, STRIKETHROUGH_TEXT_PATTERN, LINK_TEXT_PATTERN, IMAGE_PATTERN, NEWLINE_PATTERN, INDENT_PATTERN];

function concatenatePattern(patterns: string[]) {
    let concatenatedPattern = '';
    patterns.forEach((pattern) => {
        concatenatedPattern += `(${pattern})|`;
     });
    concatenatedPattern = concatenatedPattern.slice(0, -1);
	return concatenatedPattern;
}

const concatenatedPattern = new RegExp(concatenatePattern(PATTERNS), 'g');

function lex(input: string) {
    const tokens = [];

    const patternMatches = Array.from(input.matchAll(concatenatedPattern));
    let lastLexemeEndIndex = -1;

    patternMatches.forEach((patternMatch) => {
        // if the pattern match doesn't occur right after the end of the last lexeme (due to the presence of text before said pattern match), we need to add a text token first
        if (patternMatch.index! - lastLexemeEndIndex !== 1) {
			const token = { name: 'TEXT', value: input.substring(lastLexemeEndIndex + 1, patternMatch.index) };
			tokens.push(token);
            lastLexemeEndIndex = patternMatch.index! - 1;
        }

        // add token based on pattern match
        if (patternMatch[0].match(HEADING_1_PATTERN)) { // or maybe patternMatch[1] != null
			tokens.push({ name: 'HEADING 1 MARKUP', value: '=1= ' });
        } else if (patternMatch[0].match(HEADING_2_PATTERN)) {
			tokens.push({ name: 'HEADING 2 MARKUP', value: '=2= ' });
        } else if (patternMatch[0].match(HEADING_3_PATTERN)) {
			tokens.push({ name: 'HEADING 3 MARKUP', value: '=3= ' });
        } else if (patternMatch[0].match(UNORDERED_LIST_PATTERN)) {
			tokens.push({ name: 'UNORDERED LIST MARKUP', value: '* ' });
        } else if (patternMatch[0].match(ORDERED_LIST_PATTERN)) {
			tokens.push({ name: 'ORDERED LIST MARKUP', value: patternMatch[0] });
        } else if (patternMatch[0].match(HORIZONTAL_RULE_PATTERN)) {
			tokens.push({ name: 'HORIZONTAL RULE MARKUP', value: '--- ' });
        } else if (patternMatch[0].match(BOLD_TEXT_PATTERN)) {
            const lexemes = patternMatch[0].split(/(?<=`@)|(?=@`)/g);
			tokens.push({ name: 'LEFT BOLD TEXT MARKUP', value: '`@' });
            tokens.push({ name: 'TEXT', value: lexemes[1] });
            tokens.push({ name: 'RIGHT BOLD TEXT MARKUP', value: '@`' });
        } else if (patternMatch[0].match(ITALICIZED_TEXT_PATTERN)) {
            const lexemes = patternMatch[0].split(/(?<=`\/)|(?=\/`)/g);
			tokens.push({ name: 'LEFT ITALICIZED TEXT MARKUP', value: '`/' });
            tokens.push({ name: 'TEXT', value: lexemes[1] });
            tokens.push({ name: 'RIGHT ITALICIZED TEXT MARKUP', value: '/`' });
        } else if (patternMatch[0].match(UNDERLINED_TEXT_PATTERN)) {
            const lexemes = patternMatch[0].split(/(?<=`_)|(?=_`)/g);
			tokens.push({ name: 'LEFT UNDERLINED TEXT MARKUP', value: '`_' });
            tokens.push({ name: 'TEXT', value: lexemes[1] });
            tokens.push({ name: 'RIGHT UNDERLINED TEXT MARKUP', value: '_`' });
        } else if (patternMatch[0].match(HIGHLIGHTED_TEXT_PATTERN)) {
            const lexemes = patternMatch[0].split(/(?<=`=)|(?==`)/g);
			tokens.push({ name: 'LEFT HIGHLIGHTED TEXT MARKUP', value: '`=' });
            tokens.push({ name: 'TEXT', value: lexemes[1] });
            tokens.push({ name: 'RIGHT HIGHLIGHTED TEXT MARKUP', value: '=`' });
        } else if (patternMatch[0].match(STRIKETHROUGH_TEXT_PATTERN)) {
            const lexemes = patternMatch[0].split(/(?<=`-)|(?=-`)/g);
			tokens.push({ name: 'LEFT STRIKETHROUGH TEXT MARKUP', value: '`-' });
            tokens.push({ name: 'TEXT', value: lexemes[1] });
            tokens.push({ name: 'RIGHT STRIKETHROUGH TEXT MARKUP', value: '-`' });
        } else if (patternMatch[0].match(LINK_TEXT_PATTERN)) {
            const lexemes = [...patternMatch[0].split('_(')[0].split(/(?<=`_)/g), '_(', ...patternMatch[0].split('_(')[1].split(/(?=\)`)/g)];
			tokens.push({ name: 'LINK TEXT MARKUP 1', value: '`_' });
            tokens.push({ name: 'LINK ALIAS', value: lexemes[1] });
            tokens.push({ name: 'LINK TEXT MARKUP 2', value: '_(' });
            tokens.push({ name: 'LINK URL', value: lexemes[3] });
            tokens.push({ name: 'LINK TEXT MARKUP 3', value: ')`' });
        } else if (patternMatch[0].match(IMAGE_PATTERN)) {
            const lexemes = patternMatch[0].split(/(?<=image:)|(?={})/g);
			tokens.push({ name: 'IMAGE MARKUP 1', value: 'image:' });
            tokens.push({ name: 'IMAGE PATH', value: lexemes[1] });
            tokens.push({ name: 'IMAGE MARKUP 2', value: '{}' });
        } else if (patternMatch[0].match(NEWLINE_PATTERN)) {
            tokens.push({ name: 'NEWLINE', value: '\n' });
        } else if (patternMatch[0].match(INDENT_PATTERN)) {
            tokens.push({ name: 'INDENT', value: '\t' });
        }

        lastLexemeEndIndex = patternMatch.index! + patternMatch[0].length - 1;
     });

    // if there is still some text left after the last pattern match, add a final text token
    if (input.length > 0 && lastLexemeEndIndex !== input.length - 1) {
        tokens.push({ name: 'TEXT', value: input.substring(lastLexemeEndIndex + 1, input.length) });
    }
    return tokens;
}

export default lex;
