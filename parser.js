const fs = require('fs')

const HEADING_1_PATTERN = "^=1= |(?<=\\n|\\t)=1= ";
const HEADING_2_PATTERN = "^=2= |(?<=\\n|\\t)=2= ";
const HEADING_3_PATTERN = "^=3= |(?<=\\n|\\t)=3= ";
const UNORDERED_LIST_PATTERN = "^\\* |(?<=\\n|\\t)\\* ";
const ORDERED_LIST_PATTERN = "^\\d+\\. |(?<=\\n|\\t)\\d+\\. ";
const HORIZONTAL_RULE_PATTERN = "^--- |(?<=\\n|\\t)--- ";
const BOLD_TEXT_PATTERN = "`@.+@`";
const ITALIC_TEXT_PATTERN = "`\/.+\/`";
const UNDERLINED_TEXT_PATTERN = "`_.+_`";
const HIGHLIGHTED_TEXT_PATTERN = "`=.+=`";
const STRIKETHROUGH_TEXT_PATTERN = "`-.+-`";
const LINKED_TEXT_PATTERN = "`_.+_(.+)`";
const IMAGE_PATTERN = "image:.+{}";
const NEWLINE_PATTERN = "\\n";
const INDENT_PATTERN = "\\t";

const ALL_PATTERNS = [HEADING_1_PATTERN, HEADING_2_PATTERN, HEADING_3_PATTERN, UNORDERED_LIST_PATTERN, ORDERED_LIST_PATTERN, HORIZONTAL_RULE_PATTERN , BOLD_TEXT_PATTERN, ITALIC_TEXT_PATTERN, UNDERLINED_TEXT_PATTERN, HIGHLIGHTED_TEXT_PATTERN, STRIKETHROUGH_TEXT_PATTERN, LINKED_TEXT_PATTERN, IMAGE_PATTERN, NEWLINE_PATTERN, INDENT_PATTERN];

const concatenated_pattern = new RegExp(concatenate_patterns(ALL_PATTERNS), "g");

function lex(input) {
    const tokens = [];

    const pattern_matches = input.matchAll(concatenated_pattern);
    let last_lexeme_end_index = 0;

    for(let pattern_match of pattern_matches) {
        if (pattern_match.index - last_lexeme_end_index > 1) {
			// There is a text token that we need to take care of
			let token = {type: "TEXT", value: input.substring(last_lexeme_end_index + 1, pattern_match.index)};
			tokens.push(token);
			last_lexeme_end_index += pattern_match.index - 1;
        }
        
        // console.log("pattern match: " + pattern_match[0]);

        if (pattern_match[1].match(HEADING_1_PATTERN)) {
            let lexemes = pattern_match[0].split(/(?= )/g);
			tokens.push({type: "HEADING 1 INDICATOR", value: lexemes[0]});
		    tokens.push({type: "NON-PARAGRAPH BLOCK TRIGGER", value: lexemes[1]});
        } else if (pattern_match[1].match(NEWLINE_PATTERN)) {
            tokens.push({type: "NEWLINE", value: pattern_match[1]});
        }

        // switch (pattern_match[1]) {
		// 	case HEADING_1_PATTERN:
		// 		let lexemes = pattern_match[0].split(/(?= )/g);
		// 		tokens.push({type: "HEADING 1 INDICATOR", value: lexemes[0]});
		// 		tokens.push({type: "NON-PARAGRAPH BLOCK TRIGGER", value: lexemes[1]});
        //         break;
        // }

        last_lexeme_end_index += pattern_match.index + pattern_match[0].length - 1;
    }

    if (last_lexeme_end_index != input.length - 1) {
		tokens.push({type: "TEXT", value: input.substring(last_lexeme_end_index + 1, input.length)});
    }
    
    return tokens;
}

function concatenate_patterns(patterns) {
	let concatenated_pattern = "";
	for (pattern of patterns) {
		concatenated_pattern += "(" + pattern + ")|";
    }
    concatenated_pattern = concatenated_pattern.slice(0, -1);
	return concatenated_pattern;
}

let tokens = lex("=1= A beautiful heading\n");

for (let token of tokens) {
    console.log(token.type);
}
