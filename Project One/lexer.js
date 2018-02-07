function clean(s){
	//removes whitespace (except newline) not in StringExpr
	var cleaner = s.replace(/[\r\t\f\v ]+(?=([^"]*"[^"]*")*[^"]*$)/g, "");
	var cleanest = cleaner.replace(/\/\*.*\*\//g, ""); //removes comments
	return cleanest;
}

//Takes substring and makes tokens
function scanner(s){
	var tokenArray = [];
	var lastPosition = 0;
	var currentSubSize = 1;
	var foundToken = [];
	var isFound = false;
	var shinyName;
	var shinyValue;
	var shinyToken;
	while(lastPosition!=s.length){
		do {
			var subby = s.substr(lastPosition,currentSubSize); //current substring
			
			if(/^int$/.test(subby)){ //[ int ] keyword finder
				foundToken = ["T_VAR_TYPE",lastPosition,3];
				isFound = true;
			}

			else if(/^print$/.test(subby)){ //[ print ] keyword finder
				foundToken = ["T_PRINT",lastPosition,5];
				isFound = true;
			}

			else if(/^while$/.test(subby)){ //[ while ] keyword finder
				foundToken = ["T_WHILE",lastPosition,5];
				isFound = true;
			}

			else if(/^if$/.test(subby)){ //[ if ] keyword finder
				foundToken = ["T_IF",lastPosition,2];
				isFound = true;
			}

			else if(/^false$/.test(subby)){ //[ false ] keyword finder
				foundToken = ["T_FALSE",lastPosition,5];
				isFound = true;
			}

			else if(/^true$/.test(subby)){ //[ true ] keyword finder
				foundToken = ["T_TRUE",lastPosition,4];
				isFound = true;
			}

			else if(/^"[ a-z]+"$/.test(subby)){ //[ a-z & " " ] char finder
				tokenArray.push(["T_QUOTE",'"']);
				for(x = 1; x < subby.length-1; x++){
					foundToken = ["T_CHAR",x,1];
					shinyName = foundToken[0];
					shinyValue = subby.substr(x,1); //location of token value and its length
					shinyToken = [shinyName,shinyValue];
					tokenArray.push(shinyToken); //add newly minted token to token list
				}
				tokenArray.push(["T_QUOTE",'"']);
				lastPosition += subby.length-1;
				currentSubSize = 1;
			}

			else if(/^[a-z]$/.test(subby)){ //[ a-z ] id finder
				foundToken = ["T_ID",lastPosition,1];
				isFound = true;
			}

			else if(/^\=\=$/.test(subby)){ //[ == ] symbol finder
				foundToken = ["T_EQ",lastPosition,2];
				isFound = true;
			}

			else if(/^\!\=$/.test(subby)){ //[ != ] symbol finder
				foundToken = ["T_INEQ",lastPosition,2];
				isFound = true;
			}

			else if(/\=$/.test(subby)){ //[ = ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_ASSIGN",lastPosition,1];
				isFound = true;
			}

			else if(/\"$/.test(subby)){ //[ " ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_QUOTE",lastPosition,1];
				isFound = true;
			}

			else if(/\{$/.test(subby)){ //[ { ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_LBRACE",lastPosition,1];
				isFound = true;
			}

			else if(/\}$/.test(subby)){ //[ } ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_RBRACE",lastPosition,1];
				isFound = true;
			}

			else if(/\($/.test(subby)){ //[ ( ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_LPAREN",lastPosition,1];
				isFound = true;
			}

			else if(/\)$/.test(subby)){ //[ ) ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_RPAREN",lastPosition,1];
				isFound = true;
			}

			else if(/\+$/.test(subby)){ //[ + ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_ADD",lastPosition,1];
				isFound = true;
			}

			else if(/\$$/.test(subby)){ //[ $ ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_EOP",lastPosition,1];
				isFound = true;
			}

			else if(/^[0-9]$/.test(subby)){ //[ 0-9 ] digit finder
				foundToken = ["T_DIGIT",lastPosition,1];
				isFound = true;
			}

			else if (/^[^a-z0-9\$\{\}\(\)\=\"\+ ]$/.test(subby)){
				foundToken = ["ERROR: Unrecognized Token",lastPosition,1];
				isFound = true;
			}

			currentSubSize++;
		}
		while(currentSubSize<(s.length-lastPosition));
			
		if(isFound){
			lastPosition += foundToken[2];
			shinyName = foundToken[0];
			shinyValue = s.substr(foundToken[1],foundToken[2]); //location of token value and its length
			shinyToken = [shinyName,shinyValue];

			tokenArray.push(shinyToken); //add newly minted token to token list
			//reset some variables for the next loop
			foundToken = [];
			isFound = false;
			currentSubSize = 1;
		} else {
				break;
		}
	}
	return tokenArray; //array of TOKEN objects
}

// TODO: This function should create an ordered list of tokens 
// and return a String version of it
function lexer(s){
	var cs = clean(s);
	var strArr = cs.split("\n");
	var tokenLine;
	var finalTokens = "";
	var errors = 0;
	var program = 0;
	//initial messages
	finalTokens+= "DEBUG: Running in verbose mode\n\n";
	//for each substring (line) of the source code, generate its tokens
	for(i = 0; i < strArr.length; i++){
		tokenLine = scanner(strArr[i]);
		if(tokenLine[tokenLine.length-1][0] == "T_EOP"){
			program++;
			finalTokens+= "LEXER: Lexing program "+program+"...\n";
		}
		//for each token in the returned list, generate the verbose output
		for(j = 0; j < tokenLine.length; j++){
			var tokenName = tokenLine[j][0];
			var tokenValue = tokenLine[j][1];
			var correctLine = i+1;
			if(j > 1 ){
				if(tokenLine[j-1][0] == "T_EOP"){
					program++;
					finalTokens+= "LEXER: Lexing program "+program+"...\n";
				}
			}

			if(tokenName == "ERROR: Unrecognized Token"){
				errors++;
			}

			finalTokens+= "LEXER --> | "+tokenName+" [ "+tokenValue+" ] on line "+correctLine+"...\n";
			

			if(tokenName == "T_EOP" && errors == 1){
				finalTokens+= "LEXER: Lex completed with 1 error\n\n";
				errors = 0;
			}
			else if(tokenName == "T_EOP" && errors > 1){
				finalTokens+= "LEXER: Lex completed with "+errors+" errors\n\n";
				errors = 0;
			}
			else if(tokenName == "T_EOP"){
				finalTokens+= "LEXER: Lex completed successfully\n\n";
			}
		}
	}
	if(tokenLine[tokenLine.length-1][0] != "T_EOP"){
		finalTokens+= "LEXER: Warning! EOP Symbol not detected. Please add to text file.\n\n";
	}
	return finalTokens;
}