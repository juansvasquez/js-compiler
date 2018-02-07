class Token {
	constructor(name, value){
		this.name = name;
		this.value = value;
	}
}

function clean(s){
	//removes whitespace (except newline) not in StringExpr
	var cleaner = s.replace(/[\r\t\f\v ]+(?=([^"]*"[^"]*")*[^"]*$)/g, "");
	var cleanest = cleaner.replace(/\/\*.*\*\//g, ""); //removes comments
	return cleanest;
}

//Takes substring and makes tokens
function scanner(s){
	var tokenArray = [];
	var token1 = new Token("T_LBRACE", "{");
	var token2 = new Token("T_LBRACE", "{");
	var token3 = new Token("T_LBRACE", "{");
	tokenArray.push(token1, token2, token3);
	return tokenArray; //array of TOKEN objects
}

// TODO: This function should create an ordered list of tokens 
// and return a String version of it
function lexer(s){
	var cs = clean(s);
	var strArr = cs.split("\n");
	var tokenLine;
	var finalTokens = "";
	//for each substring (line) of the source code, generate its tokens
	for(i = 0; i < strArr.length; i++){
		tokenLine = scanner(strArr[i]);
		//for each token in the returned list, generate the verbose output
		for(j = 0; j < tokenLine.length; j++){
			var tokenName = tokenLine[j].name;
			var tokenValue = tokenLine[j].value;
			finalTokens+= "LEXER --> | "+tokenName+" [ "+tokenValue+" ] on line "+i+"...\n";
		}
	}
	
	return finalTokens; //should return a printed list per token
	//also errors and warnings
}