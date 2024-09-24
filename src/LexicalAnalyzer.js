let checkIfMethod = (char,input,currentPosition) => {
    let stack = "" + char;
    if (char == 'G') {
        stack += input[currentPosition + 1] + input[currentPosition + 2]
        if (stack == "GET") return [stack,2]
        else return null;
    }
    if (char == 'D') {
        stack += input.slice(currentPosition + 1,currentPosition+6);
        if (stack == "DELETE") return [stack,5];
        else return null
    }
    if (char == 'P') {
        stack += input.slice(currentPosition + 1,currentPosition+4);
        if (stack == "POST") return [stack,3];
        else if (stack.slice(0,3) == "PUT") return [stack,2];
        else return null;
    }
}

let checkIfAssert = (input,currentPosition) => {
    let word = input.slice(currentPosition,currentPosition + 6);
    if (word == "ASSERT") return true;
    else return false;
}


export function getLexicalTokens(input) {
    let tokens = []

    let currentPosition = 0;

    while (currentPosition < input.length) {
        const currentChar = input[currentPosition];
        if (currentChar == ':') tokens.push({identifier: "COLON",value:':'});
        else if (currentChar == '{' || currentChar == '}') tokens.push({identifier: "CURLY BRACES",value:currentChar});
        else if (currentChar == '-') tokens.push({identifier:"DASH",value: "-"});
        else if (currentChar == '=') tokens.push({identifier:"EQUAL",value:'='});
        else if (currentChar == '<') {
            if (input[currentPosition + 1] == '=') {
                tokens.push({identifier:"LTE",value:'<='});
                currentPosition++;
            }
            else tokens.push({identifier:"LT",value:'<'});
        }
        else if (currentChar == '>') {
            if (input[currentPosition + 1] == '=') {
                tokens.push({identifier:"GTE",value:'>='});
                currentPosition++;
            }
            else tokens.push({identifier:"GT",value:'>'});
        }
        else if (currentChar == '|') tokens.push({identifier:"BAR"});
        else if (currentChar == ',') tokens.push({identifier:"COMMA"});
        else if (currentChar == '.') tokens.push({identifier:"POINT",value:'.'});
        else if (currentChar == ';') tokens.push({identifier:"SEMICOLON",value:';'});
        else if (currentChar == 'G' || currentChar == 'P' || currentChar == 'D') {
            const method = checkIfMethod(currentChar,input,currentPosition);
            if (method) {
                tokens.push({identifier:"METHOD",value:method[0]})
                currentPosition += method[1];
            }
            else tokens.push({identifier:"LETTER",value:currentChar})
        }
        else if (currentChar == "A") {
            if (checkIfAssert(input,currentPosition)) {
                tokens.push({identifier:'ASSERT',value:"ASSERT"});
                currentPosition += 5;
            }
            else tokens.push({identifier:"LETTER",value:currentChar})
        }
        else if (currentChar == "\"") {
            let newPosition = currentPosition + 1;
            let lookAhead = input[newPosition];
            let string = "";
            while (lookAhead != "\"") {
                string += lookAhead;
                newPosition++;
                lookAhead = input[newPosition];
            }
            tokens.push({identifier:"STRING",value: string});
            currentPosition = newPosition;
        }
        else if (currentChar.match(/[a-zA-Z\/\.?#]/g)) tokens.push({identifier:"LETTER",value:currentChar});
        else if (currentChar.match(/[0-9]/g)) tokens.push({identifier:"NUMBER",value:currentChar});
        else if (currentChar.match(/\s/));
        else throw new Error("Input char not recognizable at index " + currentPosition);
        currentPosition++;
    }
    return tokens;
}

