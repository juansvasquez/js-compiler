//Parser function
//  -Receives an Array of tokens for a "program"
//  -Returns a string to be added to the final output in lexer.js
function parser(n,a,b){
  var verboseParse = ""; //string that will be returned for each program (verbose)
  var minParse = ""; //string that will be returned for each program (minimal)
	var parseErrors = false;
	var parseResult = [];

  verboseParse+= "PARSER: Parsing program " + n + "...\n";
  minParse+= "PARSER: Parsing program " + n + "...\n";
	
	parseResult = parse(a);
	parseErrors = parseResult[0];
	verboseParse+= parseResult[1];

	//no errors in parse!
	if(parseErrors == false){
    verboseParse+= "PARSER: Parse completed successfully\n\n";
    minParse+= "PARSER: Parse completed successfully\n\n";
    verboseParse+= "CST for program " + n + "...\n";
    minParse+= "CST for program " + n + "...\n";
    verboseParse+= parseResult[2]+"\n\n\n";
    minParse+= parseResult[2] + "\n\n\n";
	} else {
    verboseParse+= "PARSER: Parse failed with one or more error(s)\n\n";
    minParse+= "PARSER: Parse failed with one or more error(s)\n\n";
    verboseParse+= "CST for program "+n+": Skipped due to PARSER error(s).\n\n\n";
    minParse+= "CST for program " + n + ": Skipped due to PARSER error(s).\n\n\n";
	}

	if (b == true) {
    return verboseParse;
  } else {
    return minParse;
  }
}

//takes in the token array, returns an array of the parse result [error,parse,cst]
function parse(array){
	var currentToken = 0;
	var parseString = "";
	var cstString = "";
	var errors = false;
	var cstDepth = 0;
	var returnArr;

	function treeMaker(e){
		var treeBranch = "";
		if(e > 0){
			for(l = 0; l < e; l++){
				treeBranch+="-";
			}
		}
		return treeBranch;
	}

	function match(t){
		if(array[currentToken][0] != t && errors == false){
			parseString+= "PARSER: ERROR: Expected " + t + " got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		} else if(array[currentToken][0] != t){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		} else {
			cstString+= treeMaker(cstDepth)+"[" + array[currentToken][1] + "]\n";
			currentToken++;
		}
	}

	function parseProgram(){
		parseString+= "PARSER: parseProgram()\n";
		cstString+= "<Program>\n";
		parseBlock();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		match("T_EOP");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseBlock(){
		parseString+= "PARSER: parseBlock()\n";
		cstDepth++;
		cstString+= treeMaker(cstDepth)+"<Block>\n";
		cstDepth++;
		match("T_LBRACE");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseStatementList();
		match("T_RBRACE");
		cstDepth--;
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseStatementList(){
		parseString+= "PARSER: parseStatementList()\n";
		cstString+= treeMaker(cstDepth)+"<Statement List>\n";
		if(array[currentToken][0]=="T_PRINT" || array[currentToken][0]=="T_ID" || 
		   array[currentToken][0]=="T_VAR_TYPE_INT" || array[currentToken][0]=="T_VAR_TYPE_STRING" ||
		   array[currentToken][0]=="T_VAR_TYPE_BOOLEAN" || array[currentToken][0]=="T_WHILE" ||
		   array[currentToken][0]=="T_IF" || array[currentToken][0]=="T_LBRACE"){
			cstDepth++;
			parseStatement();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			cstDepth-=2;
			parseStatementList();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			//empty set
		}
	}

	function parseStatement(){
		parseString+= "PARSER: parseStatement()\n";
		cstString+= treeMaker(cstDepth)+"<Statement>\n";
		if(array[currentToken][0]=="T_PRINT"){
			parsePrintStatement();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_ID"){
			parseAssignmentStatement();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_VAR_TYPE_INT" || 
				array[currentToken][0]=="T_VAR_TYPE_STRING" || 
				array[currentToken][0]=="T_VAR_TYPE_BOOLEAN"){
			parseVarDecl();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_WHILE"){
			parseWhileStatement();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_IF"){
			parseIfStatement();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_LBRACE"){
			parseBlock();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected print/id/int/string/boolean/while/if/lbrace got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		}
	}

	function parsePrintStatement(){
		parseString+= "PARSER: parsePrintStatement()\n";
		cstDepth++;
		cstString+= treeMaker(cstDepth)+"<Print Statement>\n";
		match("T_PRINT");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		match("T_LPAREN");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseExpr();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		match("T_RPAREN");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseAssignmentStatement(){
		parseString+= "PARSER: parseAssignmentStatement()\n";
		cstDepth++;
		cstString+= treeMaker(cstDepth)+"<Assignment Statement>\n";
		parseId();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		match("T_ASSIGN");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseExpr();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseVarDecl(){
		parseString+= "PARSER: parseVarDecl()\n";
		cstDepth++;
		cstString+= treeMaker(cstDepth)+"<Variable Declaration Statement>\n";
		parseType();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseId();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseWhileStatement(){
		parseString+= "PARSER: parseWhileStatement()\n";
		cstDepth++;
		cstString+= treeMaker(cstDepth)+"<While Statement>\n";
		match("T_WHILE");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseBooleanExpr();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseBlock();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseIfStatement(){
		parseString+= "PARSER: parseIfStatement()\n";
		cstDepth++;
		cstString+= treeMaker(cstDepth)+"<If Statement>\n";
		match("T_IF");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseBooleanExpr();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseBlock();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseExpr(){
		parseString+= "PARSER: parseExpr()\n";
		cstString+= treeMaker(cstDepth)+"<Expression>\n";
		if(array[currentToken][0]=="T_DIGIT"){
			parseIntExpr();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_QUOTE"){
			parseStringExpr();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
    else if (array[currentToken][0] == "T_LPAREN" ||
     array[currentToken][0] == "T_FALSE" ||
     array[currentToken][0] == "T_TRUE"){
			parseBooleanExpr();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_ID"){
			parseId();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected T_DIGIT or T_QUOTE or T_LPAREN or T_ID or T_TRUE or T_FALSE got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		}
	}

	function parseIntExpr(){
		parseString+= "PARSER: parseIntExpr()\n";
		cstString+= treeMaker(cstDepth)+"<Integer Expression>\n";
		if(array[currentToken][0]=="T_DIGIT" && array[currentToken+1][0]=="T_ADD"){
			parseDigit();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseIntOp();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseExpr();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_DIGIT"){
			parseDigit();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected T_DIGIT got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		}
	}

	function parseStringExpr(){
		parseString+= "PARSER: parseStringExpr()\n";
		cstString+= treeMaker(cstDepth)+"<String Expression>\n";
		match("T_QUOTE");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseCharList();
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		match("T_QUOTE");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseBooleanExpr(){
		parseString+= "PARSER: parseBooleanExpr()\n";
		cstString+= treeMaker(cstDepth)+"<Boolean Expression>\n";
		if(array[currentToken][0]=="T_LPAREN"){
			match("T_LPAREN");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseExpr();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseBoolOp();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseExpr();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			match("T_RPAREN");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_FALSE" || array[currentToken][0]=="T_TRUE"){
			parseBoolVal();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected T_TRUE or T_FALSE or T_LPAREN got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		}
	}

	function parseId(){
		parseString+= "PARSER: parseId()\n";
		cstString+= treeMaker(cstDepth)+"<ID>\n";
		match("T_ID");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}		
	}

	function parseCharList(){
		parseString+= "PARSER: parseCharList()\n";
		cstString+= treeMaker(cstDepth)+"<Character List>\n";
		if(array[currentToken][0]=="T_CHAR"){
			parseChar();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseCharList();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_CHAR" && array[currentToken][1]==" "){
			parseSpace();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseCharList();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			//empty set
		}
	}

	function parseType(){
		parseString+= "PARSER: parseType()\n";
		cstString+= treeMaker(cstDepth)+"<Type>\n";
		if(array[currentToken][0]=="T_VAR_TYPE_INT"){
			match("T_VAR_TYPE_INT");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_VAR_TYPE_STRING"){
			match("T_VAR_TYPE_STRING");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_VAR_TYPE_BOOLEAN"){
			match("T_VAR_TYPE_BOOLEAN");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected T_VAR_TYPE_INT/STRING/BOOLEAN got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors=true;
		}
	}

	function parseChar(){
		parseString+= "PARSER: parseChar()\n";
		cstString+= treeMaker(cstDepth)+"<Character>\n";
		match("T_CHAR");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseSpace(){
		parseString+= "PARSER: parseSpace()\n";
		cstString+= treeMaker(cstDepth)+"<Space Character>\n";
		if(array[currentToken][1] != " "){
			parseString+= "PARSER: ERROR: Expected ' ' got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors=true;
		} else {
			cstString+= "[" + array[currentToken][1] + "]\n";
			currentToken++;
		}
	}

	function parseDigit(){
		parseString+= "PARSER: parseDigit()\n";
		cstString+= treeMaker(cstDepth)+"<Digit>\n";
		match("T_DIGIT");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseBoolOp(){
		parseString+= "PARSER: parseBoolOp()\n";
		cstString+= treeMaker(cstDepth)+"<Boolean Operator>\n";
		if(array[currentToken][0]=="T_EQ"){
			match("T_EQ");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_INEQ"){
			match("T_INEQ");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected T_EQ or T_INEQ got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors=true;
		}
	}

	function parseBoolVal(){
		parseString+= "PARSER: parseBoolVal()\n";
		cstString+= treeMaker(cstDepth)+"<Boolean Value>\n";
		if(array[currentToken][0]=="T_FALSE"){
			match("T_FALSE");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_TRUE"){
			match("T_TRUE");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		} else {
			parseString+= "PARSER: ERROR: Expected T_TRUE or T_FALSE got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		}
	}

	function parseIntOp(){
		parseString+= "PARSER: parseIntOp()\n";
		cstString+= treeMaker(cstDepth)+"<Addition>\n";
		match("T_ADD");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	parseString+= "PARSER: parse()\n";

	parseProgram();
	
	returnArr = [errors,parseString,cstString];
	return returnArr;
}