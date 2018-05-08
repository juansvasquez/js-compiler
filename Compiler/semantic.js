function semantic(o,a){
  var tree = o;
  var symbolArray = a;

  var tables;
  var finalString = "";

  //Create Symbol Table
  tables= symTable(a); //returns array of table and string

  //TODO:Scope Check?
  /*errors	for	undeclared	identiViers, redeclared	identiViers in the	same	scope,
    type	mismatches, and	anything	else that	might	go	wrong*/

  //TODO: Type Check
  /*warnings	about	declared	but	unused	identiViers,	use	of	uninitialized	
  variables, and	use	of	initialized	but	unused	variables*/

  //if no errors
  finalString += tables[1];

  return finalString;
}

//Takes in the array of symbols, returns symbol hash table and string for output
function symTable(a){
  var symbolArray = a;
  var table;
  var tableString;

  if (symbolArray.length == 0){
    
  }
  
  var symTableReturn = [table, tableString];
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