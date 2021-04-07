import { TOKEN_TYPE } from './constants';

export type Token = {
    name: TOKEN_TYPE,
    value: string,
};

export type ASTNode = {
	name: string,
	value: ASTNode[] | string,
};
