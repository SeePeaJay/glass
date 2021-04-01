const TRIGGER_PATTERN = /(\n\n\t+|\n\n|\n\t+|(?<=\n\t+.*)\n(?!\n|\t)|(?<=\n\n)\n|^\n|\n$)/g;

const TITLE_PATTERN = /(^|.*\n)===/;

// within blocks and triggers
const HEADING_1_MARKUP_PATTERN = /^=1= /;
const HEADING_2_MARKUP_PATTERN = /^=2= /;
const HEADING_3_MARKUP_PATTERN = /^=3= /;
const UNORDERED_LIST_MARKUP_PATTERN = /^\* /;
const ORDERED_LIST_MARKUP_PATTERN = /^\d+. /;
const HORIZONTAL_RULE_MARKUP_PATTERN = /^--- /;
const IMAGE_MARKUP_PATTERN = /image:.+?{}/;
const BOLD_TEXT_PATTERN = /`@\n?.+\n?@`/;
const ITALIC_TEXT_PATTERN = /`\/\n?.+\n?\/`/;
const UNDERLINED_TEXT_PATTERN = /`_\n?.+\n?_`/;
const HIGHLIGHTED_TEXT_PATTERN = /`=\n?.+\n?=`/;
const STRIKETHROUGH_TEXT_PATTERN = /`-\n?.+\n?-`/;
const LINK_PATTERN = /`_\n?.+\n?_\(.+?\)`/;

export {
	TRIGGER_PATTERN, TITLE_PATTERN, HEADING_1_MARKUP_PATTERN, HEADING_2_MARKUP_PATTERN, HEADING_3_MARKUP_PATTERN, UNORDERED_LIST_MARKUP_PATTERN, ORDERED_LIST_MARKUP_PATTERN, HORIZONTAL_RULE_MARKUP_PATTERN, IMAGE_MARKUP_PATTERN, BOLD_TEXT_PATTERN, ITALIC_TEXT_PATTERN, UNDERLINED_TEXT_PATTERN, HIGHLIGHTED_TEXT_PATTERN, STRIKETHROUGH_TEXT_PATTERN, LINK_PATTERN,
};