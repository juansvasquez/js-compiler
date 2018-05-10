function semantic(o,a){
  var tree = o;
  var symbolArray = a;

  var tableReturn;
  var tableObject;
  var tableString;
  var tableErrorMessage;
  var tableErrors;

  var typeCheckReturn;
  var typeCheckTable;
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
  } else { //type checking
    typeCheckReturn = typeCheck(tableObject,tree.root);
    typeCheckTable = typeCheckReturn[0];
    typeCheckString = typeCheckReturn[1];
    typeCheckErrors = typeCheckReturn[2];
    typeCheckWarnings = typeCheckReturn[3];

    finalErrWarn += typeCheckString;
    errorTally += typeCheckErrors;
    warningTally += typeCheckWarnings;

    console.log(typeCheckTable);
  } 

  //check table for ids that have not been init+used, or just not been used
  if (errorTally == 0){
    for (var sym in typeCheckTable) {
      if (typeCheckTable.hasOwnProperty(sym)) {
        if (!typeCheckTable[sym][4] && !typeCheckTable[sym][5]){
          finalErrWarn += "Warning: The id " + typeCheckTable[sym][0] + " on line " +
            typeCheckTable[sym][3] + " is not being assigned or used\n";;
          warningTally++;
        } 
        else if (!typeCheckTable[sym][5]){
          finalErrWarn += "Warning: The id [ " + typeCheckTable[sym][0] + " ] on line " +
            typeCheckTable[sym][3] + " has been assigned but is not being used\n";;
          warningTally++;
        }
      }
    }
  }

  //numbers of errors and warnings
  finalErrWarn += "Semantic Analysis produced "+ errorTally +" error(s) and " + warningTally +" warning(s)\n\n";

  //checks to see if there are errors so table can be printed
  if (errorTally > 0) {
    finalTable += "not produced due to error(s) detected by semantic analysis\n\n";
  } else {
    finalTable += tableString;
  }

  var final = [finalErrWarn, finalTable, errorTally ,typeCheckTable];
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
      errorMessage += "Error: The id [ " + symbolArray[h][0] + " ] on line " + 
        symbolArray[h][3] + " has already been declared in this scope\n";
      errors++;
      break;
    } else {
      table[currentID] = symbolArray[h];
      table[currentID].push(false); //is initialized
      table[currentID].push(false); //is used
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
    tableString += "\n\n";
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
  var package1;
  var tempID = "";
  var tempID1 = "";
  var type = "";
  var count = 0;
  var tmp = 0;

  if (node.data[0] == "BLOCK"){
    if(node.children.length > 0){
      while(tmp < node.children.length){
        package = typeCheck(table, node.children[tmp]);
        table = package[0];
        typeString += package[1];
        errors += package[2];
        warnings += package[3];
        type = package[4];
        
        if (errors > 0) {
          var typeCheckReturn = [table, typeString, errors, warnings, type];
          return typeCheckReturn;
        }
        tmp++;
      }
    } else {
      return [table,"",0,0,""];
    }
  }

  else if(node.data[0] == "Print Statement"){
    package = typeCheck(table, node.children[0]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];
    type = package[4];
    if (errors > 0) {
      var typeCheckReturn = [table, typeString, errors, warnings, type];
      return typeCheckReturn;
    }
  }

  else if (node.data[0] == "Assignment Statement") {
    //create a temp id to check against the table (id+scope)
    tempID = "" + node.children[0].data[1] + node.children[0].data[3];
    
    if(!table.hasOwnProperty(tempID)){ //if tempID not in the table, init without decl error
      count += node.children[0].data[3];
      
      for (q = count; q >= 0; q--) {
        tempID = "" + node.children[0].data[1] + q;
        if (table.hasOwnProperty(tempID)) {
          break;
        }
        console.log("Ass loop");
      }
      
      if (!table.hasOwnProperty(tempID)) {
        typeString += "Error: The id [ " + node.children[0].data[1] + " ] on line " + 
          node.children[0].data[2] + " is being assigned before declaration\n";
        errors++;
      } else {
        //if tempID is in the table, update table and compare types
        table[tempID][4] = true; //updates in table to initialized
        package = typeCheck(table, node.children[1]);
        table = package[0];
        typeString += package[1];
        errors += package[2];
        warnings += package[3];
        type = package[4];
        if (errors > 0) {
          var typeCheckReturn = [table, typeString, errors, warnings, type];
          return typeCheckReturn;
        }
        else if (type != table[tempID][1]) { //compare types
          typeString += "Error: The id [ " + node.children[0].data[1] + " ] on line " +
            node.children[0].data[2] + " has type [ " + table[tempID][1] +
            " ] and is assigned the wrong type [ " + type + " ]\n";
          errors++;
        }
      }
    } else { //if tempID is in the table, update table and compare types
      table[tempID][4] = true; //updates in table to initialized
      package = typeCheck(table, node.children[1]);
      table = package[0];
      typeString += package[1];
      errors += package[2];
      warnings += package[3];
      type = package[4];
      if (errors > 0) {
        var typeCheckReturn = [table, typeString, errors, warnings, type];
        return typeCheckReturn;
      }
      else if (type != table[tempID][1]){ //compare types
        typeString += "Error: The id [ " + table[tempID][0] + " ] on line " + 
          table[tempID][3] + " has type [ " + table[tempID][1] + 
          " ] and is assigned the wrong type [ " + type+" ]\n";
        errors++;
      }
    }
  }

  else if (node.data[0] == "Variable Declaration") {
    return [table, "", 0, 0,""];
  }

  else if (node.data[0] == "While Statement") {
    //check boolean expression first (can be a bool expr node or a boolean)
    package = typeCheck(table, node.children[0]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];
    type = package[4];

    if (errors > 0) {
      var typeCheckReturn = [table, typeString, errors, warnings, type];
      return typeCheckReturn;
    }

    //check block
    package = typeCheck(table, node.children[1]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];
    type = package[4];
  }

  else if (node.data[0] == "If Statement") {
    //check boolean expression first (can be a bool expr node or a boolean)
    package = typeCheck(table, node.children[0]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];
    type = package[4];

    if (errors > 0) {
      var typeCheckReturn = [table, typeString, errors, warnings, type];
      return typeCheckReturn;
    }

    //check block
    package = typeCheck(table, node.children[1]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];
    type = package[4];
  }

  else if (node.data[0] == "Add") {
    package = typeCheck(table, node.children[1]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];
    type = package[4];

    if (errors > 0) {
      var typeCheckReturn = [table, typeString, errors, warnings, type];
      return typeCheckReturn;
    }
    //if the second child off add is not an int, error out. Otherwise, this Add node becomes type int
    if (type != "int"){
      typeString += "Error: The expression on line " + node.data[1] + 
      " has type [ int ] and is assigned the wrong type [ " + package[4] + " ]\n";
      errors++;
    } else {
      type = "int";
    }
  }

  else if (node.data[0] == "Boolean Expression") {
    package = typeCheck(table, node.children[0]);
    table = package[0];
    typeString += package[1];
    errors += package[2];
    warnings += package[3];

    if (errors > 0) {
      var typeCheckReturn = [table, typeString, errors, warnings, type];
      return typeCheckReturn;
    }

    package1 = typeCheck(table, node.children[2]);
    table = package1[0];
    typeString += package1[1];
    errors += package1[2];
    warnings += package1[3];

    if (errors > 0) {
      var typeCheckReturn = [table, typeString, errors, warnings, type];
      return typeCheckReturn;
    }

    if (package[4] != package1[4]){
      typeString += "Error: The expression on line " + node.data[1] +
        " has type [ " + package[4] + " ] and is compared to the wrong type [ " + package1[4] + " ]\n";
      errors++;
    } else {
      type = "boolean";
    }
  }

  //not needed
  /* else if (node.data[0] == "T_EQ" || node.data[0] == "T_INEQ") {

  } */

  else if (node.data[0] == "T_DIGIT"){
    type = "int";
  }

  else if (node.data[0] == "T_TRUE" || node.data[0] == "T_FALSE") {
    type = "boolean";
  }

  else if (node.data[0] == "T_STRING") {
    type = "string";
  }

  else if (node.data[0] == "T_ID") {
    //create a temp id to check against the table (id+scope)
    tempID1 = "" + node.data[1] + node.data[3];
    //make sure id has been declared, if not error
    if (!table.hasOwnProperty(tempID1)) {
      //id may be declared in higher level scope
      count += node.data[3];
      for (q = count; q >= 0; q--){
        tempID1 = "" + node.data[1] + q;
        if (table.hasOwnProperty(tempID1)) {
          break;
        }
      }
      if (!table.hasOwnProperty(tempID1)) {
        typeString += "Error: The id [ " + node.data[1] + " ] on line " +
          node.data[2] + " is being used before declaration\n";
        errors++;
      } else { //has been declared, but check if init'd for warning
        if (!table[tempID1][4]) {
          typeString += "Warning: The id [ " + node.data[1] + " ] on line " +
            node.data[2] + " is being used before assignment\n";
          warnings++;
        }
        //mark as used, return type
        table[tempID1][5] = true;
        type = table[tempID1][1];
      }
    } else { //has been declared, but check if init'd for warning
      if (!table[tempID1][4]) {
        typeString += "Warning: The id [ " + node.data[1] + " ] on line " +
          node.data[2] + " is being used before assignment\n";
        warnings++;
      }
      //mark as used, return type
      table[tempID1][5] = true;
      type = table[tempID1][1];
    }
  }

  var typeCheckReturn = [table, typeString, errors, warnings, type];
  return typeCheckReturn;
}

