const fs = require('fs')
const lex = require('./parser');
 
test('empty string input', () => {
    expect(lex('')).toStrictEqual([]);
});

fs.readFileSync("sample.txt", (err, data) => {
    // console.log(sampleText);
    let tokens = lex(data.toString());

    for (let token of tokens) {
        console.log("token type: " + token.type + "; token value: " + token.value);
    }
});
