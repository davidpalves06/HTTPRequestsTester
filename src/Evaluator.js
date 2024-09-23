import fs from 'fs'
import {TokenParser} from "./Parser.js"
import { log } from 'console';
import {fetchRequest} from "./RequestFetcher.js"

let filename = process.argv[2];
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
log(grammarTree);
log("Grammar analyzed. Starting to evaluate requests.");
for (let i = 0; i < grammarTree.length; i++) {
    const grammarNode = grammarTree[i];
    log("Evaluating request number " + (i + 1));
    if (grammarNode.type == "REQUEST") {
        const requestResult = await fetchRequest(grammarNode.request).then(response => {
            log(response);
            return response.json();
        }).then(data => {
            log("Sucessfull request");
        }).catch(err => {
            log(err.message);
        });
    }
    else {
        console.log("ASSERTION");
    }
}


