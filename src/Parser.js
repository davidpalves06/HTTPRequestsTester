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

    isEOF() {
        if (this.position >= tokens.length) return true
        return false;
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
        expressionNode.request = this.parseRequest();
        if (this.isEOF()) return expressionNode;
        while (!this.isEOF() && this.currentToken().identifier == "NEWLINE") this.expect("NEWLINE");
        if (this.isEOF()) return expressionNode;
        throw new Error("Expected end of input but tokens still remaining.");
    }

    parseRequest() {
        let requestNode = {}
        const methodToken = this.expect("METHOD");
        requestNode.method = methodToken.value;
        this.expect("BAR");
        requestNode = {...requestNode,...this.parseURL()};
        this.expect("BAR");
        requestNode = {...requestNode,...this.parseHeaders(),...this.parseBody()};
        return requestNode;
    }

    parseURL() {
        let token = this.currentToken();
        let url = "";
        while (token.identifier != 'BAR') {
            url += token.value;
            this.advanceToken();
            token = this.currentToken();
        }
        return {url}
    }

    parseHeaders() {
        let token = this.currentToken();
        let headers = {}
        while (token.identifier == 'DASH') {
            this.advanceToken()
            token = this.currentToken();
            if (token.value != 'H') throw new Error("Malformed Header");
            this.advanceToken();
            let headerName = "";
            let headerValue = "";
            token = this.currentToken()
            while(token.identifier != "COLON") {
                headerName += token.value;
                this.advanceToken();
                token = this.currentToken();
            }
            this.advanceToken();
            token = this.currentToken()
            while(token.identifier != 'BAR' && token.identifier != 'CURLY BRACES' && token.identifier != 'DASH') {
                headerValue += token.value;
                this.advanceToken()
                token = this.currentToken()
            }
            this.expect("BAR")
            token = this.currentToken()
            headers[headerName] = headerValue;
        }
        return headers;
    }

    parseBody() {
        let token = this.currentToken();
        let body = {}
        let curly = this.expect("CURLY BRACES");
        if (curly.value != '{') throw new Error("Expected opening curly braces.");
        token = this.currentToken();
        while(token.identifier != 'CURLY BRACES') {
            let fieldName = "";
            let fieldValue = "";
            while(token.identifier != "COLON") {
                fieldName += token.value;
                this.advanceToken();
                token = this.currentToken();
            }
            this.advanceToken();
            token = this.currentToken()
            while(token.identifier != 'COMMA' && token.identifier != 'CURLY BRACES') {
                fieldValue += token.value;
                this.advanceToken()
                token = this.currentToken()
            }
            if (token.identifier == 'COMMA') this.expect("COMMA");
            token = this.currentToken()
            body[fieldName] = fieldValue;
        }
        curly = this.expect("CURLY BRACES");
        if (curly.value != '}') throw new Error("Expected closing curly braces");
        return body;
    }
}

let tokens = getLexicalTokens("result1 = GET | https://localhost.com/path/test:8080 | -H header:value | {field1: 2,field2: nome}\n \n \n");
const tokenParser = new TokenParser(tokens);
console.log(tokens)
console.log(tokenParser.parseExpression());