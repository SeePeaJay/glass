const fs = require('fs');

fs.readFileSync('sample2.txt', (data, err) => {
    console.log('hello');
    console.log(data.toString());
    // const tokens = lex(data.toString());

    // for (let token of tokens) {
    //     console.log("token name: " + token.name + "; token value: " + token.value);
    // }
});

console.log('hello');