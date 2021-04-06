import ENGRAM_TOKEN_TYPE from './token-types';

export type Token = {
    name: ENGRAM_TOKEN_TYPE,
    value: string,
};

export type ASTNode = {
	name: string,
	value: ASTNode[] | string,
};
