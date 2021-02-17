export type Token = {
    name: string,
    value: string,
};

export type ASTNode = {
	name: string,
	value: ASTNode[] | string,
};
