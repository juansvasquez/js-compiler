//Parser function
//  -Receives an Array of tokens for a "program"
//  -Returns a string to be added to the final output in lexer.js
function parser(n,a){
	var finalParse = ""; //string that will be returned for each program
	var parseErrors = 0;
	var parseResult = [];

	finalParse+= "PARSER: Parsing program "+n+"...\n";
	
	parseResult = parse(a);
	parseErrors = parseResult[0];
	finalParse+= parseResult[1];

	//no errors in parse!
	if(parseErrors == 0){
		finalParse+= "PARSER: Parse completed successfully\n\n";
		finalParse+= "CST for program "+n+"...\n";
		finalParse+= parseResult[2];
	} else {
		finalParse+= "PARSER: Parse failed with "+parseErrors+" error(s)\n\n";
		finalParse+= "CST for program "+n+": Skipped due to PARSER error(s).\n\n\n";
	}

	
	return finalParse;
	// var tokens = "";
	// if(a.length == 0){
	// 	return "EMPTY\n\n\n";
	// } else {
	// 	for(k=0; k<a.length; k++){
	// 		tokens+= "[" + a[k][0] + " , " + a[k][1] + "]";
	// 	}
	// 	return tokens +"\n\n\n";
	// }
}

//takes in the token array, returns an array of the parse result [# errors found,parse,cst]
function parse(array){
	var currentToken = 0;
	var parseString = "";
	var cstString = "TODO";
	var errorNum = 0;
	var cstDepth = 0;
	var returnArr;

	// function treeMaker(e){
	// 	var treeBranch = "";
	// 	if(e > 0){
	// 		for(l = 0; l < e; l++){
	// 			treeBranch+="-";
	// 		}
	// 	}
	// 	return treeBranch;
	// }

	function match(t){
		if(array[currentToken][0] != t){
			parseString+= "PARSER: ERROR: Expected " + t + " got " + array[currentToken][0] + " with value '" + array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errorNum++;
			currentToken++;
		} else {
			// cstDepth++;
			// cstString+= treeMaker(cstDepth) + "[" + array[currentToken][1] + "]\n";
			currentToken++;
		}
	}

	function parseProgram(){
		parseString+= "PARSER: parseProgram()\n";
		//cstString+= "<Program>\n";
		parseBlock();
		//cstDepth = 0;
		match("T_EOP");
	}

	function parseBlock(){
		parseString+= "PARSER: parseBlock()\n";
		//cstDepth++;
		//cstString+= treeMaker(cstDepth) + "<Block>\n";
		match("T_LBRACE");
		parseStatementList();
		//cstDepth--;
		match("T_RBRACE");
		//cstDepth--;
	}

	function parseStatementList(){
		parseString+= "PARSER: parseStatementList()\n";
		if(array[currentToken][0]=="T_LBRACE"){
			// cstString+= treeMaker(cstDepth) + "<Statement List>\n";
			// cstDepth++;
			parseStatement();
			parseStatementList();
		} else {
			//empty set
		}
	}

	function parseStatement(){
		parseString+= "PARSER: parseStatement()\n";
		//cstString+= treeMaker(cstDepth) + "<Statement>\n";
		parseBlock();
	}

	parseString+= "PARSER: parse()\n";

	parseProgram();
	
	returnArr = [errorNum,parseString,cstString];
	return returnArr;
}