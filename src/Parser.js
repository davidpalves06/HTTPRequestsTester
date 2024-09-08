const { getLexicalTokens } = require("./LexicalAnalyzer.js")


class TokenParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    currentToken() {
        return this.tokens[this.position];
    }

    advanceToken() {
        this.position++;
    }

    expect(identifier) {
        const token = this.currentToken();
        if (token && token.identifier === identifier) {
          this.advanceToken();
          return token;
        } else {
          throw new Error(`Expected ${identifier}, but found ${token ? token.identifier : 'EOF'}`);
        }
    }

    lookAhead(steps) {
        return this.tokens[this.position + steps];
    }

    parseExpression() {
        let expressionNode = {}
        let token = this.currentToken();
        if (token.identifier == 'LETTER') {
            let resultVariable = "";
            while((token.identifier == 'LETTER' || token.identifier == 'NUMBER')) {
                resultVariable += token.value;
                this.advanceToken();
                token = this.currentToken();
            }
            this.expect("EQUAL");
            expressionNode.resultVariable = resultVariable;
        }
        const methodToken = this.expect("METHOD");
        expressionNode.method = methodToken.value;
        console.log(expressionNode);
    }
}

let tokens = getLexicalTokens("GET | localhost:8080 | -H header:value | {field1: 2,field2: nome}");
const tokenParser = new TokenParser(tokens);
tokenParser.parseExpression();