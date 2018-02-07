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

			else if(/^if$/.test(subby)){ //[] keyword finder
				foundToken = ["T_IF",lastPosition,2];
				isFound = true;
			}

			else if(/^false$/.test(subby)){ //[] keyword finder
				foundToken = ["T_FALSE",lastPosition,5];
				isFound = true;
			}

			else if(/^true$/.test(subby)){ //[] keyword finder
				foundToken = ["T_TRUE",lastPosition,4];
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

			else if(/\$$/.test(subby)){ //[ $ ] symbol finder
				if(isFound){ //if we've already found a token and hit this symbol
					break;
				}
				foundToken = ["T_EOP",lastPosition,1];
				isFound = true;
			}

			// else {
			// 	foundToken = ["ERROR: Unrecognized Token",lastPosition,1];
			// 	isFound = true;
			// }

			currentSubSize++;
		}
		while(currentSubSize<(s.length-lastPosition));
			
		if(isFound){
			lastPosition += foundToken[2];
			var shinyName = foundToken[0];
			var shinyValue = s.substr(foundToken[1],foundToken[2]); //location of token value and its length
			var shinyToken = [shinyName,shinyValue];

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
	//for each substring (line) of the source code, generate its tokens
	for(i = 0; i < strArr.length; i++){
		tokenLine = scanner(strArr[i]);
		//for each token in the returned list, generate the verbose output
		for(j = 0; j < tokenLine.length; j++){
			var tokenName = tokenLine[j][0];
			var tokenValue = tokenLine[j][1];
			var correctLine = i+1;
			//TODO: LAST SUBSTRING, NO EOL TOKEN
			//TODO: ERROR TOKENS MESSAGE
			finalTokens+= "LEXER --> | "+tokenName+" [ "+tokenValue+" ] on line "+correctLine+"...\n";
		}
	}
	return finalTokens; //should return a printed list per token
	//also errors and warnings
}