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
	var isQuote = false;
	var shinyName;
	var shinyValue;
	var shinyToken;
	//while we haven't exhausted the string
	while(lastPosition != s.length){
		
		//continue the scan while the substring size is less than 
		//the OG string minus the last position looked at
		do {
			var subby = s.substr(lastPosition,currentSubSize); //current substring
			
			if(/^int$/.test(subby)){ //[ int ] keyword finder
				foundToken = ["T_VAR_TYPE",lastPosition,3];
				isFound = true;
			}

			else if(/^string$/.test(subby)){ //[ string ] keyword finder
				foundToken = ["T_VAR_TYPE",lastPosition,6];
				isFound = true;
			}

			else if(/^boolean$/.test(subby)){ //[ boolean ] keyword finder
				foundToken = ["T_VAR_TYPE",lastPosition,7];
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

			else if(/^"[ a-z]+"$/.test(subby)){ //[ string line e.g. "a" ] char finder
				foundToken = [subby,subby.length];
				isQuote = true;
				isFound = true;
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
		while(currentSubSize<=(s.length-lastPosition));
		
		//found a quote block!
		if(isFound && isQuote){
			lastPosition += foundToken[1];
			tokenArray.push(["T_QUOTE",'"']);
			for(x = 1; x < foundToken[1]-1; x++){
			 	shinyName = "T_CHAR";
			 	shinyValue = foundToken[0][x];
			 	shinyToken = [shinyName, shinyValue];
			 	tokenArray.push(shinyToken);
			}
			tokenArray.push(["T_QUOTE",'"']);
			foundToken = [];
			isFound = false;
			isQuote = false;
			currentSubSize = 1;
		}

		//found a token!
		else if(isFound){
			//using the length of the token, we calculate the new lastPosition
			lastPosition += foundToken[2];

			shinyName = foundToken[0];

			//we make a substring starting from the token's starting position to its end
			//this is its "value"
			shinyValue = s.substr(foundToken[1],foundToken[2]);
			
			//this is the token object
			shinyToken = [shinyName,shinyValue];

			//add newly minted token to token list
			tokenArray.push(shinyToken);

			//reset some variables for the next loop
			foundToken = [];
			isFound = false;
			currentSubSize = 1;
		} else {
			break;
		}
	}//end while
	return tokenArray; //array of tokens
}

// This function should create an ordered list of tokens 
// and return a String version of it
function lexer(s){
	var cs = clean(s); //removes whitespace (not in strings) and comments from text input
	var strArr = cs.split("\n"); //makes text input into an array of arrays, divided by newLines
	var tokArr = []; //array of scanned lines
	var tokenLine;
	var finalTokens = ""; //string that will be sent to index.html
	var errors = 0;
	var program = 1;
	var correctLine = 0;
	var EOPChecker = [];
	//Verbose Mode Message
	finalTokens+= "DEBUG: Running in verbose mode\n\n";
	finalTokens+= "LEXER: Lexing program "+program+"...\n";
	//for each substring (line) of the source code, generate its tokens
	for(i = 0; i < strArr.length; i++){
		correctLine++;
		if(strArr[i]== ""){
			tokArr.push(["NAT"]); //placeholder in the masterlist, NotAToken
			continue;
		} else {
			tokenLine = scanner(strArr[i]); //scan current line, return its token list
			
			//if the previous line ended in a EOP, we are in a new program
			if(EOPChecker[0] == "T_EOP"){
				program++;
				finalTokens+= "LEXER: Lexing program "+program+"...\n";
			}

			EOPChecker = tokenLine[tokenLine.length-1]; //save the last token in the list

			tokArr.push(tokenLine);//save the scanned line to the master list
			
			//for each token in the list, generate the verbose output
			for(j = 0; j < tokenLine.length; j++){
				var tokenName = tokenLine[j][0];
				var tokenValue = tokenLine[j][1];
				
				//if we have a new program on the same line
				if(j > 0 ){
					if(tokenLine[j-1][0] == "T_EOP"){
						program++;
						finalTokens+= "LEXER: Lexing program "+program+"...\n";
					}
				}

				//if we
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
	}
	if(tokenLine[tokenLine.length-1][0] != "T_EOP"){
		finalTokens+= "LEXER: Warning! EOP Symbol not detected. Please add to text file.\n\n";
	}
	return finalTokens;
}