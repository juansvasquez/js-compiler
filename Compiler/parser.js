//Parser function
//  -Receives an Array of tokens for a "program"
//  -Returns a string to be added to the final output in lexer.js
function parser(n,a,b){
  var verboseParse = ""; //string that will be returned for each program (verbose)
  var minParse = ""; //string that will be returned for each program (minimal)
	var parseErrors = false;
  var parseResult = [];
  var semanticResults;
  var codeGenResult;

  verboseParse+= "PARSER: Parsing program " + n + "...\n";
  minParse+= "PARSER: Parsing program " + n + "...\n";
	
	parseResult = parse(a);
	parseErrors = parseResult[0];
	verboseParse+= parseResult[1];

	//no errors in parse!
	if(parseErrors == false){
    semanticResults = semantic(parseResult[4], parseResult[5]); //pass tree and symbols, returns array with errors/warnings string and table string

    if(semanticResults[2] == 0){
      codeGenResult = codeGen(parseResult[4],semanticResults[3]); //pass tree and table
    }

    verboseParse+= "PARSER: Parse completed successfully\n\n";
    minParse+= "PARSER: Parse completed successfully\n\n";

    verboseParse += "Program " + n + " Semantic Analysis...\n";
    minParse += "Program " + n + " Semantic Analysis...\n";

    verboseParse += semanticResults[0];     //errors/warnings
    minParse += semanticResults[0];         //errors/warnings
    
    verboseParse+= "CST for program " + n + "...\n";
    minParse+= "CST for program " + n + "...\n";
    verboseParse+= parseResult[2]+"\n";
    minParse+= parseResult[2] + "\n";

    verboseParse += "AST for program " + n + "...\n";
    minParse += "AST for program " + n + "...\n";
    verboseParse += parseResult[3] + "\n\n";
    minParse += parseResult[3] + "\n\n";

    //console.log(parseResult[4].root);     //display AST in console for debugging

    verboseParse += "Symbol Table for program " + n + "...\n";
    minParse += "Symbol Table for program " + n + "...\n";
    verboseParse += semanticResults[1];     //symbol table
    minParse += semanticResults[1];         //symbol table

    verboseParse += "6502a Assembly Code Generation for program " + n + "...\n";
    minParse += "6502a Assembly Code Generation for program " + n + "...\n";
    verboseParse += codeGenResult;     //code gen
    minParse += codeGenResult;         //code gen    

	} else {
    verboseParse+= "PARSER: Parse failed with one or more error(s)\n\n";
    minParse+= "PARSER: Parse failed with one or more error(s)\n\n";
    verboseParse+= "CST for program "+ n +": Skipped due to PARSER error(s).\n\n\n";
    minParse+= "CST for program " + n + ": Skipped due to PARSER error(s).\n\n\n";
	}

	if (b == true) {
    return verboseParse;
  } else {
    return minParse;
  }
}

//takes in the token array, returns an array of the parse result [error,parse,cst]
function parse(array,tree){
	var currentToken = 0;
	var parseString = "";
  var cstString = "";
  var astString = "";
	var errors = false;
  var cstDepth = 0;
  var astDepth = 0;

  //Boolean assist
  var boolDepth = 0;

  //Add assist
  var addDepth = 0;

  //Tree Object Vars
  var asTree = new Tree();
  var scope = -1;
  var blockList = [];
  var string = "";

  //Symbol Table Helpers
  var symbolArray = []; //array of declared symbols

  var returnArr;
  
  parseString += "PARSER: parse()\n";

  parseProgram();

  returnArr = [errors, parseString, cstString, astString, asTree, symbolArray];
  return returnArr;

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
		parseBlock([0]);
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

	function parseBlock(arr){
		parseString+= "PARSER: parseBlock()\n";
    
    //CST
    cstDepth++;
		cstString+= treeMaker(cstDepth)+"<Block>\n";
    cstDepth++;
    //AST
    astString+= treeMaker(astDepth)+"< BLOCK >\n";
    astDepth++;

    //Tree
    scope++;
    blockList.push(["BLOCK", array[currentToken][2], scope]); //add block to blocklist

    if (arr.length == 1){
      if (scope > 0){
        asTree.add(blockList[scope],blockList[scope-1]); //parent will be previous scope's block node
      } else {
        asTree.add(blockList[scope]);
      }
    } else {
      asTree.add(blockList[scope], arr); //parent will be if or while
    }

		match("T_LBRACE");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
    }
    parseStatementList();
    
    scope--;

		match("T_RBRACE");
    
    cstDepth--;
    astDepth--;
    
    if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseStatementList(){
    parseString+= "PARSER: parseStatementList()\n";
    //CST
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
    //CST
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
			parseBlock([0]);
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
    
    //CST
    cstDepth++;
    cstString+= treeMaker(cstDepth)+"<Print Statement>\n";
    //AST
    astString+= treeMaker(astDepth) + "< Print Statement >\n";

    //Tree
    var printNode = ["Print Statement", array[currentToken][2], scope];
    asTree.add(printNode,blockList[scope]); //add [print node, parent block]
    
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
    
    astDepth++;

		parseExpr(printNode);
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
    match("T_RPAREN");
    
    astDepth--;

		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseAssignmentStatement(){
		parseString+= "PARSER: parseAssignmentStatement()\n";
    
    //CST
    cstDepth++;
    cstString+= treeMaker(cstDepth)+"<Assignment Statement>\n";
    //AST
    astString += treeMaker(astDepth) + "< Assignment Statement >\n";
    astDepth++;
    
    //Tree
    var assignmentNode = ["Assignment Statement", array[currentToken][2],scope];

    asTree.add(assignmentNode, blockList[scope]); //add [assignment node, parent block]

    parseId(assignmentNode);
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		match("T_ASSIGN");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
    parseExpr(assignmentNode);
    
    astDepth--;

		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseVarDecl(){
		parseString+= "PARSER: parseVarDecl()\n";
    
    //CST
    cstDepth++;
    cstString+= treeMaker(cstDepth)+"<Variable Declaration Statement>\n";
    //AST
    astString += treeMaker(astDepth) + "< Variable Declaration >\n";
    astDepth++;

    //Tree
    var declarationNode = ["Variable Declaration", array[currentToken][2], scope];

    asTree.add(declarationNode, blockList[scope]); //add [variable decl node, parent block]

    //Symbol Table Helper

    symbolArray.push([array[currentToken + 1][1], array[currentToken][1], scope, array[currentToken][2]]);

		parseType(declarationNode);
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
    parseId(declarationNode);
    
    astDepth--;

		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseWhileStatement(){
		parseString+= "PARSER: parseWhileStatement()\n";
    //CST
    cstDepth++;
    cstString+= treeMaker(cstDepth)+"<While Statement>\n";
    //AST
    astString += treeMaker(astDepth) + "< While Statement >\n";
    astDepth++;

    //Tree
    var whileNode = ["While Statement", array[currentToken][2], scope];

    asTree.add(whileNode, blockList[scope]); //add [while node, parent block]

		match("T_WHILE");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseBooleanExpr(whileNode);
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
    parseBlock(whileNode);
    
    astDepth--;

		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseIfStatement(){
		parseString+= "PARSER: parseIfStatement()\n";
    //CST
    cstDepth++;
    cstString+= treeMaker(cstDepth)+"<If Statement>\n";
    //AST
    astString += treeMaker(astDepth) + "< If Statement >\n";
    astDepth++;

    //Tree
    var ifNode = ["If Statement", array[currentToken][2], scope];

    asTree.add(ifNode, blockList[scope]); //add [if node, parent block]

		match("T_IF");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
		parseBooleanExpr(ifNode);
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
    parseBlock(ifNode);
    
    astDepth--;

		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseExpr(arr){
		parseString+= "PARSER: parseExpr()\n";
    cstString+= treeMaker(cstDepth)+"<Expression>\n";

		if(array[currentToken][0]=="T_DIGIT"){
			parseIntExpr(arr);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
		else if(array[currentToken][0]=="T_QUOTE"){
			parseStringExpr(arr);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
		}
    else if (array[currentToken][0] == "T_LPAREN"){
      parseBooleanExpr(arr);
      if (errors) {
        returnArr = [errors, parseString, cstString];
        return returnArr;
      }
    }
    else if (array[currentToken][0] == "T_FALSE" ||
     array[currentToken][0] == "T_TRUE"){
      parseBoolVal(arr);
      if (errors) {
        returnArr = [errors, parseString, cstString];
        return returnArr;
      }
		}
		else if(array[currentToken][0]=="T_ID"){
			parseId(arr);
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

	function parseIntExpr(arr){
    parseString+= "PARSER: parseIntExpr()\n";
    //CST
    cstString+= treeMaker(cstDepth)+"<Integer Expression>\n";
		if(array[currentToken][0]=="T_DIGIT" && array[currentToken+1][0]=="T_ADD"){
      //AST
      astString += treeMaker(astDepth) + "< Add >\n";
      astDepth++;
      addDepth++;

      //Tree
      var addNode = ["Add", array[currentToken][2], scope, addDepth];

      asTree.add(addNode, arr); //add [add node, parent]

			parseDigit(addNode);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseIntOp();
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseExpr(addNode);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
      }
      astDepth--;
		}
		else if(array[currentToken][0]=="T_DIGIT"){
			parseDigit(arr);
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
    //astDepth--;
	}

	function parseStringExpr(arr){
		parseString+= "PARSER: parseStringExpr()\n";
    cstString+= treeMaker(cstDepth)+"<String Expression>\n";
    //AST
    astString += treeMaker(astDepth) + "[ ";

    string = ""; //reset variable
    var stringLine = array[currentToken][2];

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
    //AST
    astString += " ]\n";
    //ADD THE RIGHT STRING NODE TO THE AST
    //Tree
    var stringNode = ["T_STRING", string, stringLine,scope];
    asTree.add(stringNode, arr); //add [string node, parent]
    string = ""; //reset variable

	}

	function parseBooleanExpr(arr){
		parseString+= "PARSER: parseBooleanExpr()\n";
		cstString+= treeMaker(cstDepth)+"<Boolean Expression>\n";
		if(array[currentToken][0]=="T_LPAREN"){
      //AST
      astString += treeMaker(astDepth) + "< Boolean Expression >\n";
      astDepth++;
      boolDepth++;
      //Tree
      var boolExpNode = ["Boolean Expression", array[currentToken][2], scope, boolDepth];
      asTree.add(boolExpNode, arr); //add [bool exp node, parent block]
			match("T_LPAREN");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseExpr(boolExpNode);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseBoolOp(boolExpNode);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
			parseExpr(boolExpNode);
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
      match("T_RPAREN");
			if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
      }
      astDepth--;
    } else if (array[currentToken][0] == "T_TRUE" || array[currentToken][0] == "T_FALSE"){
      parseBoolVal(arr);
      if(errors){
				returnArr = [errors,parseString,cstString];
				return returnArr;
			}
    } else {
			parseString+= "PARSER: ERROR: Expected T_LPAREN or T_TRUE or T_FALSE got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors = true;
		}
	}

	function parseId(arr){
		parseString+= "PARSER: parseId()\n";
    cstString+= treeMaker(cstDepth)+"<ID>\n";
    //AST
    astString += treeMaker(astDepth) + "[ " + array[currentToken][1] + " ]\n";
    
    //Tree
    array[currentToken].push(scope);
    asTree.add(array[currentToken], arr); //add [id node, parent]
    
    match("T_ID");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}		
	}

	function parseCharList(){
		parseString+= "PARSER: parseCharList()\n";
		cstString+= treeMaker(cstDepth)+"<Character List>\n";
    if (array[currentToken][0] == "T_CHAR" && array[currentToken][1] == " ") {
      parseSpace();
      if (errors) {
        returnArr = [errors, parseString, cstString];
        return returnArr;
      }
      parseCharList();
      if (errors) {
        returnArr = [errors, parseString, cstString];
        return returnArr;
      }
    }
    else if(array[currentToken][0]=="T_CHAR"){
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
		} else {
			//empty set
		}
	}

	function parseType(arr){
		parseString+= "PARSER: parseType()\n";
    cstString+= treeMaker(cstDepth)+"<Type>\n";
    //AST
    astString += treeMaker(astDepth) + "[ " + array[currentToken][1] + " ]\n";
    //Tree
    array[currentToken].push(scope);
    asTree.add(array[currentToken], arr); //add [type node, parent]
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
    //AST
    astString += array[currentToken][1];
    string += array[currentToken][1];
		match("T_CHAR");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
    }
	}

	function parseSpace(){
		parseString+= "PARSER: parseSpace()\n";
    cstString+= treeMaker(cstDepth)+"<Space Character>\n";
    //AST
    astString += array[currentToken][1];
    string += array[currentToken][1];
		if(array[currentToken][1] != " "){
			parseString+= "PARSER: ERROR: Expected ' ' got " + 
			array[currentToken][0] + " with value '" + 
			array[currentToken][1] + "' on line " + array[currentToken][2] + "\n";
			errors=true;
		} else {
      cstString += treeMaker(cstDepth) +"[" + array[currentToken][1] + "]\n";
			currentToken++;
		}
	}

	function parseDigit(arr){
		parseString+= "PARSER: parseDigit()\n";
    cstString+= treeMaker(cstDepth)+"<Digit>\n";
    //AST
    astString += treeMaker(astDepth) + "[ " + array[currentToken][1] + " ]\n";
    //Tree
    array[currentToken].push(scope);
    asTree.add(array[currentToken], arr); //add [type node, parent]
		match("T_DIGIT");
		if(errors){
			returnArr = [errors,parseString,cstString];
			return returnArr;
		}
	}

	function parseBoolOp(arr){
		parseString+= "PARSER: parseBoolOp()\n";
    cstString+= treeMaker(cstDepth)+"<Boolean Operator>\n";
    //AST
    astString += treeMaker(astDepth) + "[ " + array[currentToken][1] + " ]\n";
    //Tree
    array[currentToken].push(scope);
    asTree.add(array[currentToken], arr); //add [bool op node, parent]
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

	function parseBoolVal(arr){
		parseString+= "PARSER: parseBoolVal()\n";
    cstString+= treeMaker(cstDepth)+"<Boolean Value>\n";
    //AST
    astString += treeMaker(astDepth) + "[ " + array[currentToken][1] + " ]\n";
    //Tree
    array[currentToken].push(scope);
    asTree.add(array[currentToken], arr); //add [bool val node, parent]
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
}