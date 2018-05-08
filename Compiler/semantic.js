function semantic(o,a){
  var tree = o;
  var symbolArray = a;

  var tableReturn;
  var tableObject;
  var tableString;
  var tableErrorMessage;
  var tableErrors;

  var finalErrWarn = "";
  

  //Create Symbol Table
  tableReturn= symTable(symbolArray); //returns array of table and string
  tableObject = tableReturn[0];
  tableString = tableReturn[1];
  tableErrorMessage = tableReturn[2];
  tableErrors = tableReturn[3];

  //TODO:Scope Check?
  /*errors	for	undeclared	identiViers, redeclared	identiViers in the	same	scope,
    type	mismatches, and	anything	else that	might	go	wrong*/

  //TODO: Type Check
  /*warnings	about	declared	but	unused	identiViers,	use	of	uninitialized	
  variables, and	use	of	initialized	but	unused	variables*/

  //TODO: FINAL errors/warnings string

  //if no errors
  
  var final = [/*ERRORS/WARNINGS STRING, TABLE STRING*/];
  return final;
}

//Takes in the array of symbols, returns symbol dictionary and string for output
//[[id, type, scope, line],[id, type, scope, line]]
function symTable(a){
  var symbolArray = a;
  var table = {};
  var tableString = "";
  var errorMessage = "";
  var errors = 0;

  //transform symbol array into dictionary with key/value pairs
  //keys are id+scope
  for (i = 0; i < symbolArray.length; i++){
    var currentID = symbolArray[i][0] + symbolArray[i][2];
    if(currentID in table){
      errorMessage += "Error: The id " + symbolArray[i][0] + " on line " + symbolArray[i][3] + " has already been declared in this scope\n";
      errors++;
      break;
    } else {
      table.currentID = symbolArray[i];
    }
  }
  
  if(errors == 0){
    tableString += "---------------------------\n";
    tableString += "Name   Type   Scope   Line\n";
    tableString += "---------------------------\n";
    //TODO: for each key/value pair we print an entry
  } else {
    tableString += "not produced due to error(s) detected by semantic analysis\n\n";
  }

  var symTableReturn = [table,tableString,errorMessage,errors];
  return symTableReturn;
}

/* function symbolScan(n){
  var node = n;
  var id;
  var type;
  var scope;
  var line;
  var finalArray = [];
  //check if node has children
  if (node.children.length > 0){
    if (node.data[0] == "Variable Declaration"){
      id = node.children[1].data[1];
      type = node.children[0].data[1];
      scope = node.children[0].data[3];
      line = node.children[0].data[2];
      return [id, type, scope, line];
    } 
    else if(node.data[0] == "BLOCK") {
        for (i = 0; i < node.children.length; i++) {
          finalArray.push(symbolScan(node.children[i]));
        }
    } 
    return finalArray;
  } else {
    return [];
  }
} */