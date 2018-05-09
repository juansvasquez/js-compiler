function semantic(o,a){
  var tree = o;
  var symbolArray = a;

  console.log(o);
  console.log(a);

  var tableReturn;
  var tableObject;
  var tableString;
  var tableErrorMessage;
  var tableErrors;

  var typeCheckReturn;
  var typeCheckString;
  var typeCheckErrors;
  var typeCheckWarnings;

  var finalErrWarn = "";           //where warning and error messages are printed
  var errorTally = 0;
  var warningTally = 0; 
  var finalTable = "";            //final table string
  

  //Create Symbol Table
  tableReturn= symTable(symbolArray); //returns array of table and string
  tableObject = tableReturn[0];
  tableString = tableReturn[1];
  tableErrorMessage = tableReturn[2];
  tableErrors = tableReturn[3];

  errorTally += tableErrors;
  
  
  //if there were table errors, skip type checking and go straight to out putting error messages
  if (tableErrors > 0) {
    finalErrWarn += tableErrorMessage;
  } /* else { //type checking
    typeCheckReturn = typeCheck(tableObject,tree);
  } */

  //numbers of errors and warnings
  finalErrWarn += "Semantic Analysis produced "+ errorTally +" error(s) and " + warningTally +" warning(s)\n\n";

  //checks to see if there are errors so table can be printed
  if (errorTally > 0) {
    finalTable += "not produced due to error(s) detected by semantic analysis\n\n";
  } else {
    finalTable += tableString;
  }

  var final = [finalErrWarn, finalTable];
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
  var currentID;

  //transform symbol array into dictionary with key/value pairs
  //keys are id+scope
  for (h = 0; h < symbolArray.length; h++) {
    currentID = symbolArray[h][0] + symbolArray[h][2]; //id+scope
    if (table.hasOwnProperty(currentID)) {
      errorMessage += "Error: The id " + symbolArray[h][0] + " on line " + symbolArray[h][3] + " has already been declared in this scope\n";
      errors++;
      break;
    } else {
      table[currentID] = symbolArray[h];
    }
  }

  if(errors == 0){
    tableString += "------------------------------------------\n";
    tableString += "Name \xa0\xa0 Scope \xa0\xa0 Line \xa0\xa0 Type\n";
    tableString += "------------------------------------------\n";
    for (var id in table) {
      if (table.hasOwnProperty(id)) {
        tableString += "\xa0\xa0\xa0" + table[id][0] + "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0" + table[id][2] + 
          "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0" + table[id][3] + "\xa0\xa0\xa0\xa0\xa0\xa0" + table[id][1]+"\n";
      }
    }
  } else {
    tableString += "not produced due to error(s) detected by semantic analysis\n\n\n";
  }

  var symTableReturn = [table,tableString,errorMessage,errors];
  return symTableReturn;
}

function typeCheck(o,t){
  var table = o;
  var node = t;
  var typeString = "";
  var errors = 0;
  var warnings = 0;
  var package;

  if (node.data[0] == "BLOCK"){
    if(node.children.length > 0){
      for (c = 0; c < node.children.length; c++){
        package = typeCheck(o, node.children[c]);
        typeString += package[0];
        errors += package[1];
        warnings += package[2];
      }
    } else {
      return ["",0,0];
    }
  }
  else if(node.data[0] == "Print Statement"){
    package = typeCheck(o, node.children[0]);
    typeString += package[0];
    errors += package[1];
    warnings += package[2];

  }
  else if (node.data[0] == "Assignment Statement") {

  }

  var typeCheckReturn = [typeString, errors, warnings];
  return typeCheckReturn;
}

function nodeCheck(t){
  var node = t;
  if (node.data[0]){

  }
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