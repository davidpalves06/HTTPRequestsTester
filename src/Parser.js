const {getLexicalTokens} = require('./LexicalAnalyzer.js')


class TokenParser {
    constructor(input) {
        let lexicalTokens = getLexicalTokens(input);
        this.tokens = lexicalTokens;
        this.position = 0;
    }

    currentToken() {
        return this.tokens[this.position];
    }

    advanceToken() {
        this.position++;
    }

    isEOF() {
        if (this.position >= this.tokens.length) return true
        return false;
    }

    expect(identifier) {
        const token = this.currentToken();
        if (token && token.identifier === identifier) {
          this.advanceToken();
          return token;
        } else {
          throw new Error(`Expected ${identifier}, but found ${token ? token.identifier : 'EOF'} at ${this.position}`);
        }
    }

    lookAhead(steps) {
        return this.tokens[this.position + steps];
    }

    parseGrammar() {
        return this.parseExpressions();
    }
    parseExpressions() {
        let expressionQueue = []
        
        while (!this.isEOF()) {
            expressionQueue.push(this.parseExpression());
        }
        return expressionQueue;
    }

    parseExpression() {
        let expressionNode = {}
        let token = this.currentToken();
        if (token.identifier == 'LETTER') {
            token = this.parseHTTPRequest( expressionNode);
        }
        else if (token.identifier == "ASSERT") {
            token = this.parseASSERT( expressionNode);
        }
        else {
            throw new Error("Expression is malformed!");
        }
        
        this.expect("SEMICOLON");
        return expressionNode;
    }

    parseHTTPRequest(expressionNode) {
        let resultVariable = "";
        let token = this.currentToken()
        while ((token.identifier == 'LETTER' || token.identifier == 'NUMBER')) {
            resultVariable += token.value;
            this.advanceToken();
            token = this.currentToken();
        }
        this.expect("EQUAL");
        expressionNode.type = "REQUEST";
        expressionNode.resultVariable = resultVariable;
        expressionNode.request = this.parseRequest();
        return token;
    }

    parseASSERT( expressionNode) {
        this.expect("ASSERT");
        let token = this.currentToken();
        let assertField = "";
        expressionNode.type = "ASSERT";
        while ((token.identifier == 'LETTER' || token.identifier == 'NUMBER')) {
            assertField += token.value;
            this.advanceToken();
            token = this.currentToken();
        }
        expressionNode.assertField = assertField;
        this.expect("BAR")
        expressionNode.headers = this.parseHeaders();
        token = this.currentToken();
        while (token.identifier != "BAR" && token.identifier != "SEMICOLON") {
            expressionNode.body = this.parseField();
            token = this.currentToken();
        }
        return token;
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
            if (token.identifier == "CURLY BRACES" && token.value == "{") {
                fieldValue = this.parseBody();
                token = this.currentToken()
            }
            else {
                while(token.identifier != 'COMMA' && token.identifier != 'CURLY BRACES') {
                    fieldValue += token.value;
                    this.advanceToken()
                    token = this.currentToken()
                }
            }
            body[fieldName] = fieldValue;
            if (token.identifier == 'COMMA') this.expect("COMMA");
            token = this.currentToken();
        }
        curly = this.expect("CURLY BRACES");
        if (curly.value != '}') throw new Error("Expected closing curly braces");
        return body;
    }

    parseField() {
        let fieldName = "";
        let fieldValue = "";
        let fieldOperator;
        let token = this.currentToken();
        
        while(token.identifier != "EQUAL" && token.identifier != "LT" 
            && token.identifier != "GT" && token.identifier != "GTE" && token.identifier != "LTE") {
            fieldName += token.value;
            this.advanceToken();
            token = this.currentToken();
        }

        fieldOperator = token.identifier;
        this.advanceToken();
        token = this.currentToken()
        while(token.identifier != 'BAR' && token.identifier != 'SEMICOLON') {
            fieldValue += token.value;
            this.advanceToken()
            token = this.currentToken()
        }
        if (token.identifier == 'BAR') this.advanceToken();
        return {fieldName,fieldName,fieldOperator};
    }
}


module.exports = {TokenParser}