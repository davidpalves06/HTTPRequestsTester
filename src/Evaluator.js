const fs = require('fs')
const {TokenParser} = require('./Parser');

let filename = process.argv[2]
if (filename == undefined) {
    console.error("No File was submitted to test.Exiting...")
    process.exit(0);
}

try {
    var fileInput = fs.readFileSync(filename, 'utf8');
} catch (err) {
    console.error('Erro ao ler o ficheiro:', err.message);
}

let parser = new TokenParser(fileInput);
let grammarTree = parser.parseGrammar();