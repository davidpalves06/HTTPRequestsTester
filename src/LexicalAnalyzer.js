function getLexicalTokens(input) {
    let tokens = []

    let currentPosition = 0;

    while (currentPosition < input.length) {
        const currentChar = input[currentPosition];
        if (currentChar == ':') tokens.push({identifier: "COLON"});
        else if (currentChar == '{' || currentChar == '}') tokens.push({identifier: "CURLY BRACES",value:currentChar});
        else if (currentChar == '-') tokens.push({identifier:"DASH"});
        else if (currentChar == '=') tokens.push({identifier:"EQUAL"});
        else if (currentChar == '|') tokens.push({identifier:"BAR"});
        else if (currentChar == ',') tokens.push({identifier:"COMMA"});
        else if (currentChar == 'G' || currentChar == 'P' || currentChar == 'D') {
            if ((method = checkIfMethod(currentChar,input,currentPosition))) {
                tokens.push({identifier:"METHOD",value:method[0]})
                currentPosition += method[1];
            }
            else tokens.push({identifier:"LETTER",value:currentChar})
        }
        else if (currentChar.match(/[a-zA-Z]/g)) tokens.push({identifier:"LETTER",value:currentChar});
        else if (currentChar.match(/[0-9]/g)) tokens.push({identifier:"NUMBER",value:currentChar});
        else if (currentChar.match(/\s/));
        else throw new Error("Input char not recognizable at index " + currentPosition);
        currentPosition++;
    }
    return tokens;
}

checkIfMethod = (char,input,currentPosition) => {
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

module.exports = {getLexicalTokens}


