"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TOKENS = {
    HEADING_1_MARKUP: {
        name: 1 /* HEADING_1_MARKUP */,
        value: '=1= ',
    },
    HEADING_2_MARKUP: {
        name: 2 /* HEADING_2_MARKUP */,
        value: '=2= ',
    },
    HEADING_3_MARKUP: {
        name: 3 /* HEADING_3_MARKUP */,
        value: '=3= ',
    },
    UNORDERED_LIST_MARKUP: {
        name: 4 /* UNORDERED_LIST_MARKUP */,
        value: '* ',
    },
    HORIZONTAL_RULE_MARKUP: {
        name: 6 /* HORIZONTAL_RULE_MARKUP */,
        value: '--- ',
    },
    IMAGE_MARKUP_1: {
        name: 7 /* IMAGE_MARKUP_1 */,
        value: 'image:',
    },
    IMAGE_MARKUP_2: {
        name: 8 /* IMAGE_MARKUP_2 */,
        value: '{}',
    },
    LEFT_BOLD_TEXT_MARKUP: {
        name: 10 /* LEFT_BOLD_TEXT_MARKUP */,
        value: '`@',
    },
    RIGHT_BOLD_TEXT_MARKUP: {
        name: 11 /* RIGHT_BOLD_TEXT_MARKUP */,
        value: '@`',
    },
    LEFT_ITALIC_TEXT_MARKUP: {
        name: 12 /* LEFT_ITALIC_TEXT_MARKUP */,
        value: '`/',
    },
    RIGHT_ITALIC_TEXT_MARKUP: {
        name: 13 /* RIGHT_ITALIC_TEXT_MARKUP */,
        value: '/`',
    },
    LEFT_UNDERLINED_TEXT_MARKUP: {
        name: 14 /* LEFT_UNDERLINED_TEXT_MARKUP */,
        value: '`_',
    },
    RIGHT_UNDERLINED_TEXT_MARKUP: {
        name: 15 /* RIGHT_UNDERLINED_TEXT_MARKUP */,
        value: '_`',
    },
    LEFT_HIGHLIGHTED_TEXT_MARKUP: {
        name: 16 /* LEFT_HIGHLIGHTED_TEXT_MARKUP */,
        value: '`=',
    },
    RIGHT_HIGHLIGHTED_TEXT_MARKUP: {
        name: 17 /* RIGHT_HIGHLIGHTED_TEXT_MARKUP */,
        value: '=`',
    },
    LEFT_STRIKETHROUGH_TEXT_MARKUP: {
        name: 18 /* LEFT_STRIKETHROUGH_TEXT_MARKUP */,
        value: '`-',
    },
    RIGHT_STRIKETHROUGH_TEXT_MARKUP: {
        name: 19 /* RIGHT_STRIKETHROUGH_TEXT_MARKUP */,
        value: '-`',
    },
    LINK_MARKUP_1: {
        name: 20 /* LINK_MARKUP_1 */,
        value: '`_',
    },
    LINK_MARKUP_2: {
        name: 21 /* LINK_MARKUP_2 */,
        value: '_(',
    },
    LINK_MARKUP_3: {
        name: 22 /* LINK_MARKUP_3 */,
        value: ')`',
    },
    BLANK_LINE: {
        name: 27 /* BLANK_LINE */,
        value: '',
    },
};
exports.default = TOKENS;
