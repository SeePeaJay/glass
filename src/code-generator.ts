class CodeGenerator {
	blocksAndTriggers: string[];

	constructor() {
		this.blocksAndTriggers = [];
	}

	generateHTML(blocksAndTriggers: string[]) {
		this.blocksAndTriggers = blocksAndTriggers;
	}
}

export default CodeGenerator;
