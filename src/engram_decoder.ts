class EngramDecoder {
	engram: string;

	constructor() {
		this.engram = '';
	}

	decodeEngram(engram: string = this.engram, outputFormat: string = 'HTML') {
		this.engram = engram;
		console.log(outputFormat);
    }

	getUpdatedEngram() { // somehow rewrite source engram?
		return this.engram;
	}
}

export default EngramDecoder;
