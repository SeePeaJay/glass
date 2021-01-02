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

const PATTERNS = [HEADING_1_PATTERN, HEADING_2_PATTERN, HEADING_3_PATTERN, UNORDERED_LIST_PATTERN, ORDERED_LIST_PATTERN, HORIZONTAL_RULE_PATTERN , BOLD_TEXT_PATTERN, ITALICIZED_TEXT_PATTERN, UNDERLINED_TEXT_PATTERN, HIGHLIGHTED_TEXT_PATTERN, STRIKETHROUGH_TEXT_PATTERN, LINK_TEXT_PATTERN, IMAGE_PATTERN, NEWLINE_PATTERN, INDENT_PATTERN];

const concatenated_pattern = new RegExp(concatenate_patterns(PATTERNS), 'g');

const HEADING_1_TOKEN_NAME = 'HEADING 1 MARKUP';
const HEADING_1_TOKEN_VALUE = '=1= ';
const HEADING_2_TOKEN_NAME = 'HEADING 2 MARKUP';
const HEADING_2_TOKEN_VALUE = '=2= ';
const HEADING_3_TOKEN_NAME = 'HEADING 3 MARKUP';
const HEADING_3_TOKEN_VALUE = '=3= ';
const UNORDERED_LIST_TOKEN_NAME = 'UNORDERED LIST MARKUP';
const UNORDERED_LIST_TOKEN_VALUE = '* ';
const ORDERED_LIST_TOKEN_NAME = 'ORDERED LIST MARKUP';
const HORIZONTAL_RULE_TOKEN_NAME = 'HORIZONTAL RULE MARKUP';
const HORIZONTAL_RULE_TOKEN_VALUE = '--- ';
const BOLD_TEXT_TOKEN_NAMES = ['LEFT BOLD TEXT MARKUP', 'RIGHT BOLD TEXT MARKUP'];
const BOLD_TEXT_TOKEN_VALUES = ['`@', '@`'];
const ITALICIZED_TEXT_TOKEN_NAMES = ['LEFT ITALICIZED TEXT MARKUP', 'RIGHT ITALICIZED TEXT MARKUP'];
const ITALICIZED_TEXT_TOKEN_VALUES = ['`/', '/`'];
const UNDERLINED_TEXT_TOKEN_NAMES = ['LEFT UNDERLINED TEXT MARKUP', 'RIGHT UNDERLINED TEXT MARKUP'];
const UNDERLINED_TEXT_TOKEN_VALUES = ['`_', '_`'];
const HIGHLIGHTED_TEXT_TOKEN_NAMES = ['LEFT HIGHLIGHTED TEXT MARKUP', 'RIGHT HIGHLIGHTED TEXT MARKUP'];
const HIGHLIGHTED_TEXT_TOKEN_VALUES = ['`=', '=`'];
const STRIKETHROUGH_TEXT_TOKEN_NAMES = ['LEFT STRIKETHROUGH TEXT MARKUP', 'RIGHT STRIKETHROUGH TEXT MARKUP'];
const STRIKETHROUGH_TEXT_TOKEN_VALUES = ['`-', '-`'];
const LINK_TEXT_TOKEN_NAMES = ['LINK TEXT MARKUP 1', 'LINK ALIAS', 'LINK TEXT MARKUP 2', 'LINK URL', 'LINK TEXT MARKUP 3'];
const LINK_TEXT_TOKEN_VALUES = ['`_', '_(', ')`'];
const IMAGE_TOKEN_NAMES = ['IMAGE MARKUP 1', 'IMAGE PATH', 'IMAGE MARKUP 2'];
const IMAGE_TOKEN_VALUES = ['image:', '{}'];
const NEWLINE_TOKEN_NAME = 'NEWLINE';
const NEWLINE_TOKEN_VALUE = '\n';
const INDENT_TOKEN_NAME = 'INDENT';
const INDENT_TOKEN_VALUE = '\t';

function lex(input) {
    const tokens = [];

    const pattern_matches = input.matchAll(concatenated_pattern);
    let last_lexeme_end_index = -1;

    for(let pattern_match of pattern_matches) {
        if (pattern_match.index - last_lexeme_end_index != 1) {
			// There is a text token that we need to take care of
			let token = {name: 'TEXT', value: input.substring(last_lexeme_end_index + 1, pattern_match.index)};
			tokens.push(token);
            last_lexeme_end_index = pattern_match.index - 1;
        }
        
        if (pattern_match[0].match(HEADING_1_PATTERN)) { // or maybe pattern_match[1] != null
			tokens.push({name: HEADING_1_TOKEN_NAME, value: HEADING_1_TOKEN_VALUE});
        } else if (pattern_match[0].match(HEADING_2_PATTERN)) {
			tokens.push({name: HEADING_2_TOKEN_NAME, value: HEADING_2_TOKEN_VALUE});
        } else if (pattern_match[0].match(HEADING_3_PATTERN)) {
			tokens.push({name: HEADING_3_TOKEN_NAME, value: HEADING_3_TOKEN_VALUE});
        } else if (pattern_match[0].match(UNORDERED_LIST_PATTERN)) {
			tokens.push({name: UNORDERED_LIST_TOKEN_NAME, value: UNORDERED_LIST_TOKEN_VALUE});
        } else if (pattern_match[0].match(ORDERED_LIST_PATTERN)) {
			tokens.push({name: ORDERED_LIST_TOKEN_NAME, value: pattern_match[0]});
        } else if (pattern_match[0].match(HORIZONTAL_RULE_PATTERN)) {
			tokens.push({name: HORIZONTAL_RULE_TOKEN_NAME, value: HORIZONTAL_RULE_TOKEN_VALUE});
        } else if (pattern_match[0].match(BOLD_TEXT_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?<=`@)|(?=@`)/g);
			tokens.push({name: BOLD_TEXT_TOKEN_NAMES[0], value: BOLD_TEXT_TOKEN_VALUES[0]});
            tokens.push({name: 'TEXT', value: lexemes[1]});
            tokens.push({name: BOLD_TEXT_TOKEN_NAMES[1], value: BOLD_TEXT_TOKEN_VALUES[1]});
        } else if (pattern_match[0].match(ITALICIZED_TEXT_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?<=`\/)|(?=\/`)/g);
			tokens.push({name: ITALICIZED_TEXT_TOKEN_NAMES[0], value: ITALICIZED_TEXT_TOKEN_VALUES[0]});
            tokens.push({name: 'TEXT', value: lexemes[1]});
            tokens.push({name: ITALICIZED_TEXT_TOKEN_NAMES[1], value: ITALICIZED_TEXT_TOKEN_VALUES[1]});
        } else if (pattern_match[0].match(UNDERLINED_TEXT_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?<=`_)|(?=_`)/g);
			tokens.push({name: UNDERLINED_TEXT_TOKEN_NAMES[0], value: UNDERLINED_TEXT_TOKEN_VALUES[0]});
            tokens.push({name: 'TEXT', value: lexemes[1]});
            tokens.push({name: UNDERLINED_TEXT_TOKEN_NAMES[1], value: UNDERLINED_TEXT_TOKEN_VALUES[1]});
        } else if (pattern_match[0].match(HIGHLIGHTED_TEXT_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?<=`=)|(?==`)/g);
			tokens.push({name: HIGHLIGHTED_TEXT_TOKEN_NAMES[0], value: HIGHLIGHTED_TEXT_TOKEN_VALUES[0]});
            tokens.push({name: 'TEXT', value: lexemes[1]});
            tokens.push({name: HIGHLIGHTED_TEXT_TOKEN_NAMES[1], value: HIGHLIGHTED_TEXT_TOKEN_VALUES[1]});
        } else if (pattern_match[0].match(STRIKETHROUGH_TEXT_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?<=`-)|(?=-`)/g);
			tokens.push({name: STRIKETHROUGH_TEXT_TOKEN_NAMES[0], value: STRIKETHROUGH_TEXT_TOKEN_VALUES[0]});
            tokens.push({name: 'TEXT', value: lexemes[1]});
            tokens.push({name: STRIKETHROUGH_TEXT_TOKEN_NAMES[1], value: STRIKETHROUGH_TEXT_TOKEN_VALUES[1]});
        } else if (pattern_match[0].match(LINK_TEXT_PATTERN)) {
            let lexemes = [...pattern_match[0].split('_(')[0].split(/(?<=`_)/g), '_(', ...pattern_match[0].split('_(')[1].split(/(?=\)`)/g)];
			tokens.push({name: LINK_TEXT_TOKEN_NAMES[0], value: LINK_TEXT_TOKEN_VALUES[0]});
            tokens.push({name: LINK_TEXT_TOKEN_NAMES[1], value: lexemes[1]});
            tokens.push({name: LINK_TEXT_TOKEN_NAMES[2], value: LINK_TEXT_TOKEN_VALUES[1]});
            tokens.push({name: LINK_TEXT_TOKEN_NAMES[3], value: lexemes[3]});
            tokens.push({name: LINK_TEXT_TOKEN_NAMES[4], value: LINK_TEXT_TOKEN_VALUES[2]});
        } else if (pattern_match[0].match(IMAGE_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?<=image:)|(?={})/g);
			tokens.push({name: IMAGE_TOKEN_NAMES[0], value: IMAGE_TOKEN_VALUES[0]});
            tokens.push({name: IMAGE_TOKEN_NAMES[1], value: lexemes[1]});
            tokens.push({name: IMAGE_TOKEN_NAMES[2], value: IMAGE_TOKEN_VALUES[1]});
        } else if (pattern_match[0].match(NEWLINE_PATTERN)) {
            tokens.push({name: NEWLINE_TOKEN_NAME, value: NEWLINE_TOKEN_VALUE});
        } else if (pattern_match[0].match(INDENT_PATTERN)) {
            tokens.push({name: INDENT_TOKEN_NAME, value: INDENT_TOKEN_VALUE});
        }

        last_lexeme_end_index = pattern_match.index + pattern_match[0].length - 1;
    }

    if (input.length > 0 && last_lexeme_end_index != input.length - 1) {
        tokens.push({name: 'TEXT', value: input.substring(last_lexeme_end_index + 1, input.length)});
    }
    
    return tokens;
}

function concatenate_patterns(patterns) {
	let concatenated_pattern = '';
	for (let pattern of patterns) {
		concatenated_pattern += '(' + pattern + ')|';
    }
    concatenated_pattern = concatenated_pattern.slice(0, -1);
	return concatenated_pattern;
}

const TOKEN_NAMES_AND_VALUES = {HEADING_1_TOKEN_NAME, HEADING_1_TOKEN_VALUE, HEADING_2_TOKEN_NAME, HEADING_2_TOKEN_VALUE, HEADING_3_TOKEN_NAME, HEADING_3_TOKEN_VALUE, UNORDERED_LIST_TOKEN_NAME, UNORDERED_LIST_TOKEN_VALUE, ORDERED_LIST_TOKEN_NAME, HORIZONTAL_RULE_TOKEN_NAME, HORIZONTAL_RULE_TOKEN_VALUE, BOLD_TEXT_TOKEN_NAMES, BOLD_TEXT_TOKEN_VALUES, ITALICIZED_TEXT_TOKEN_NAMES, ITALICIZED_TEXT_TOKEN_VALUES, UNDERLINED_TEXT_TOKEN_NAMES, UNDERLINED_TEXT_TOKEN_VALUES, HIGHLIGHTED_TEXT_TOKEN_NAMES, HIGHLIGHTED_TEXT_TOKEN_VALUES, STRIKETHROUGH_TEXT_TOKEN_NAMES, STRIKETHROUGH_TEXT_TOKEN_VALUES, LINK_TEXT_TOKEN_NAMES, LINK_TEXT_TOKEN_VALUES, IMAGE_TOKEN_NAMES, IMAGE_TOKEN_VALUES, NEWLINE_TOKEN_NAME, NEWLINE_TOKEN_VALUE, INDENT_TOKEN_NAME, INDENT_TOKEN_VALUE};

module.exports = lex;
