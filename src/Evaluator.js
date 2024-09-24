import fs from 'fs'
import {TokenParser} from "./Parser.js"
import { error, log } from 'console';
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
let requestResults = {};
log("Grammar analyzed. Starting to evaluate requests.");
for (let i = 0; i < grammarTree.length; i++) {
    const grammarNode = grammarTree[i];
    log("---------------------------------------------------");
    log("Evaluating step number " + (i + 1));
    if (grammarNode.type == "REQUEST") {
        let requestResult = {};
        const responseBody = await fetchRequest(grammarNode.request).then((response) => {
            if (!response.ok) error(`Request failed with status ${response.status}`);
            else log("Request succeeded with status " + response.status);
            requestResult.status = response.status;
            requestResult.headers = response.headers;
            return response.json();
        })
        .then((data) => {
            return data;
        }).catch((err) => {
            log(`Request failed due to network problem : ${err.message}`);
            process.exit(-1);
        });
        requestResult.body = responseBody;
        requestResults[grammarNode.resultVariable] = requestResult;
        log(requestResult);
    }
    else {
        log(`Asserting value: ${grammarNode.assertField}`);
        const resultToAssert = requestResults[grammarNode.assertField];
        if (resultToAssert === undefined) {
            error(`${grammarNode.assertField} is not a valid request result. Assertion failed \u{274C}`)
            process.exit(-1);
        }
        for (const header in grammarNode.headers) {
            if (resultToAssert.headers.get(header) == grammarNode.headers[header]){
                log(`Header ${header} is correct \u{2705}`)
            } else {
                error(`Header ${header} is wrong \u{274C}.\nExpected ${grammarNode.headers[header]} but got ${resultToAssert.headers.get(header)}\nAssertion failed in step ${i+1}.`)
                process.exit(-1);
            }
        }
        const bodyToAssert = resultToAssert.body;
        for(const field of grammarNode.body) {
            let {fieldName,fieldValue,fieldOperator} = field;
            assertField(fieldOperator, bodyToAssert, fieldName, fieldValue, i);
        }
    }
}
log("---------------------------------------------------");


function assertField(fieldOperator, bodyToAssert, fieldName, fieldValue, i) {
    switch (fieldOperator) {
        case "EQUAL":
            if (bodyToAssert[fieldName] != fieldValue) {
                error(`Field ${fieldName} is wrong \u{274C}.\nExpected ${fieldValue} but got ${bodyToAssert[fieldName]}.\nAssertion failed in step ${i + 1}.`);
                process.exit(-1);
            } else log(`Field ${fieldName} is correct \u{2705}`);
            break;
        case "LT":
            if (!(bodyToAssert[fieldName] < fieldValue)) {
                error(`Field ${fieldName} is wrong \u{274C}.\nExpected ${fieldValue} > ${bodyToAssert[fieldName]}.\nAssertion failed in step ${i + 1}.`);
                process.exit(-1);
            } else log(`Field ${fieldName} is correct \u{2705}`);
            break;
        case "GT":
            if (!(bodyToAssert[fieldName] > fieldValue)) {
                error(`Field ${fieldName} is wrong \u{274C}.\nExpected ${fieldValue} < ${bodyToAssert[fieldName]}.\nAssertion failed in step ${i + 1}.`);
                process.exit(-1);
            } else log(`Field ${fieldName} is correct \u{2705}`);
            break;
        case "LTE":
            if (!(bodyToAssert[fieldName] <= fieldValue)) {
                error(`Field ${fieldName} is wrong \u{274C}.\nExpected ${fieldValue} >= ${bodyToAssert[fieldName]}.\nAssertion failed in step ${i + 1}.`);
                process.exit(-1);
            } else log(`Field ${fieldName} is correct \u{2705}`);
            break;
        case "GTE":
            if (!(bodyToAssert[fieldName] >= fieldValue)) {
                error(`Field ${fieldName} is wrong \u{274C}.\nExpected ${fieldValue} <= ${bodyToAssert[fieldName]}.\nAssertion failed in step ${i + 1}.`);
                process.exit(-1);
            } else log(`Field ${fieldName} is correct \u{2705}`);
            break;
        default:
            error("Unknow Operator. Exiting...");
            process.exit(-1);
    }
}
