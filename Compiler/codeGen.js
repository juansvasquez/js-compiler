function codeGen(t, o){
  var ast = t;
  var symTab = o;
  console.log(ast.root);
  console.log(symTab);
  var statTab = {};
  var jumpsTab = {};
  var finalString = "";
  var grid = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
              [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

  //final vars
  var traversalResults;
  var traversalGrid;
  var traversalSymTab;
  var traversalStatTab;
  var traversalJumpsTab;
  var traversalErrors;
  var traversalErrorMessage;

  traversalResults = traversal(ast.root, grid, symTab, statTab, jumpsTab);
  traversalGrid = traversalResults[0];
  traversalStatTab = traversalResults[1];
  traversalJumpsTab = traversalResults[2];
  traversalErrors = traversalResults[3];
  traversalErrorMessage = traversalResults[4];

  console.log(traversalStatTab);

  //check for errors
  if (traversalErrors > 0){
    finalString += traversalErrorMessage;
  } else {
    //Populate empty bytes with 00
    for(g = 0; g < grid.length; g++){
      if(grid[g].length == 0){
        grid[g][0] = "00";
      }
    }

    //transform grid into string to be returned
    for (g = 0; g < grid.length; g++){
      finalString += grid[g][0] +"\xa0";
      if(g % 16 == 15){
        finalString += "\n";
      }
    }
  }

  return finalString;
}

function traversal(n,g,sy,st,jt){
  var node = n;
  var grid = g;
  var sym = sy;
  var stat = st;
  var jumps = jt;
  var errors = 0;
  var errorM = "";
  var package;
  var bc = 0;
  var spot;

  if (node.data[0] == "BLOCK") {
    console.log("BLOCK");
    if (node.children.length > 0) {
      while (bc < node.children.length) {
        package = traversal(node.children[bc],grid,sym,stat,jumps);
        grid = package[0];
        stat = package[1];
        jumps = package[2];
        errors += package[3];
        errorM = package[4];
        //check for errors
        if (errors > 0) {
          var traversalReturn = [grid, stat, jumps, errors, errorM];
          return traversalReturn;
        }

        bc++;
      }
    } else {
      return [grid,stat,jumps,errors,errorM];
    }
  }

  else if(node.data[0] == "Print Statement"){
    console.log("PRINT");
  }

  else if (node.data[0] == "Assignment Statement") {
    console.log("ASSIGN");
  }

  else if (node.data[0] == "Variable Declaration") {
    console.log("VARDECL");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot+5) > 255){
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "A9";
      grid[spot+1][0] = "00";
      grid[spot+2][0] = "8D";
      //make an entry in the static table
      for (temp = 0; temp < 10; temp++){
        var tmpID = "T"+temp+"X"+"X";
        if (!stat.hasOwnProperty(tmpID)){
          //static table [id,scope,address]
          stat[tmpID] = [node.children[1].data[1], node.children[1].data[3]];
          grid[spot + 3][0] = "T"+temp;
          grid[spot + 4][0] = "XX";
          break;
        }
      }
    }
  }
  
  else if (node.data[0] == "While Statement") {
    console.log("WHILE");
  }

  else if (node.data[0] == "If Statement") {
    console.log("IF");
  }

  else if (node.data[0] == "Add") {
    console.log("ADD");
  }

  else if (node.data[0] == "Boolean Expression") {
    console.log("BOOLEXPR");
  }

  else if (node.data[0] == "T_STRING") {
    console.log("STRING");
  }

  else if (node.data[0] == "T_ID") {
    console.log("ID");
  }

  else if (node.data[0] == "T_VAR_TYPE_INT") {
    console.log("TYPEINT");
  }

  else if (node.data[0] == "T_VAR_TYPE_STRING") {
    console.log("TYPESTRING");
  }

  else if (node.data[0] == "T_VAR_TYPE_BOOLEAN") {
    console.log("TYPEBOOL");
  }

  else if (node.data[0] == "T_DIGIT") {
    console.log("DIGIT");
  }

  else if (node.data[0] == "T_EQ") {
    console.log("==");
  }

  else if (node.data[0] == "T_INEQ") {
    console.log("!=");
  }

  else if (node.data[0] == "T_TRUE") {
    console.log("TRUE");
  }

  else if (node.data[0] == "T_FALSE") {
    console.log("FALSE");
  }

  var traversalReturn = [grid, stat, jumps, errors, errorM];
  return traversalReturn;
}


//finds next open spot in the grid from the top-down
function spotFinderTD(g){
  var grid = g;
  for (p = 0; p < grid.length; p++) {
    //if spot is empty
    if (grid[p].length == 0) {
      return p;
    }
  }
  return -1;
}

//finds next open spot in the grid from the bottom-up
function spotFinderBU(g) {
  var grid = g;
  for (m = 255; m >= 0; m--) {
    //if spot is empty
    if (grid[m].length == 0) {
      return m;
    }
  }
  return -1;
}

/* var grid = [[1], [2], [3], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
[], [], [], [], [], [], [], [], [], [], [], [], [], [5], [4], [3]];

console.log(spotFinderBU(grid)); */
