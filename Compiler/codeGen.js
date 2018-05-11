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
  var traversalErrors = 0;
  var traversalErrorMessage;
  var spot;

  traversalResults = traversal(ast.root, grid, symTab, statTab, jumpsTab);
  traversalGrid = traversalResults[0];
  traversalStatTab = traversalResults[1];
  traversalJumpsTab = traversalResults[2];
  traversalErrors = traversalResults[3];
  traversalErrorMessage = traversalResults[4];

  console.log(traversalStatTab);

  //break, to be safe
  spot = spotFinderTD(traversalGrid);
  if (spot > 255 || traversalGrid[spot].length > 0) {
    traversalErrorMessage = "Code exceeds 256 bytes!";
    traversalErrors++;
  } else {
    traversalGrid[spot][0] = "00";
  }

  //backpatch jumps
  if (Object.keys(traversalJumpsTab).length === 0 && traversalJumpsTab.constructor === Object){
    //no jumps to backpatch
  } else {
    for (var id in traversalJumpsTab) {
      if (traversalJumpsTab.hasOwnProperty(id)) {
        //find the key in the table
        for (g = 0; g < traversalGrid.length; g++) {
          if (traversalGrid[g][0] == id){
            var dist = spot-g;
            //console.log(dist);
            traversalJumpsTab[id][0] = dist;
            var newDist = dist.toString(16);
            //console.log(newDist);
            if (newDist.length == 1){
              traversalGrid[g][0] = "0" +newDist;
            } else {
              traversalGrid[g][0] = newDist;
            }
          }
        }
      }
    }
  }

  //Begin Static Variable Area
  if (Object.keys(traversalStatTab).length === 0 && traversalStatTab.constructor === Object) {
    //no vars to backpatch
  } else {
    spot = spotFinderTD(traversalGrid);
    if (spot > 255 || traversalGrid[spot].length > 0) {
      traversalErrorMessage = "Code exceeds 256 bytes!";
      traversalErrors++;
    } else {
      for (var id in traversalStatTab) {
        if (traversalStatTab.hasOwnProperty(id)) {
          console.log(id);
          spot = spotFinderTD(traversalGrid);
          traversalGrid[spot][0] = "00";
          var hexSpot = spot.toString(16);
          hexSpot.toUpperCase();
          traversalStatTab[id].push(hexSpot);
          spot = spotFinderTD(traversalGrid);
          for (g = 0; g < spot; g++) {
            // if we find T#XX
            var idChecker = "" + traversalGrid[g][0] + traversalGrid[g + 1][0];
            if (idChecker == id) {
              traversalGrid[g][0] = traversalStatTab[id][3];
              traversalGrid[g+1][0] = "00";
            }
          }
        }
      }
    }
  }
  console.log(traversalStatTab);
  //check for errors
  if (traversalErrors > 0){
    finalString += traversalErrorMessage;
  } else {
    //Populate empty bytes with 00
    for (g = 0; g < traversalGrid.length; g++){
      if (traversalGrid[g].length == 0){
        traversalGrid[g][0] = "00";
      }
    }

    //transform grid into string to be returned
    for (g = 0; g < traversalGrid.length; g++){
      finalString += traversalGrid[g][0] +"\xa0";
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
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 6) > 255 || grid[spot + 6].length > 0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[0].data[0] == "T_DIGIT"){
        grid[spot][0] = "A0";
      } else{
        grid[spot][0] = "AC";
      }
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "A2";
      grid[spot + 1][0] = "01";
      grid[spot + 2][0] = "FF";
    }
  }

  else if (node.data[0] == "Assignment Statement") {
    console.log("ASSIGN");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 6) > 255 || grid[spot+6].length>0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[1].data[0] == "T_DIGIT") {
        grid[spot][0] = "A9";
      } else {
        grid[spot][0] = "AD";
      }
      package = traversal(node.children[1], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];
      
      spot = spotFinderTD(grid);
      grid[spot][0] = "8D";

      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];
    }
  }

  else if (node.data[0] == "Variable Declaration") {
    console.log("VARDECL");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 5) > 255 || grid[spot + 5].length > 0){
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else if (stat.hasOwnProperty("T9XX")){
      errorM = "You have exceeded the 9 variable limit!"
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
          stat[tmpID] = [temp, node.children[1].data[1], node.children[1].data[3]];
          grid[spot + 3][0] = "T"+temp;
          grid[spot + 4][0] = "XX";
          break;
        }
      }
    }
  }
  
  else if (node.data[0] == "While Statement") {
    console.log("WHILE");
    pot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 8) > 255 || grid[spot + 8].length > 0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "AE";
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];
      
      package = traversal(node.children[1], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];
    }
  }

  else if (node.data[0] == "If Statement") {
    console.log("IF");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 8) > 255 || grid[spot + 8].length > 0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      package = traversal(node.children[1], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];
    }
  }

  else if (node.data[0] == "Add") {
    console.log("ADD");
  }

  else if (node.data[0] == "Boolean Expression") {
    console.log("BOOLEXPR");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 8) > 255 || grid[spot + 8].length > 0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "AE";
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "EC";

      package = traversal(node.children[2], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "D0";

      for (tmp = 0; tmp < 10; tmp++) {
        var tmpID = "J" + tmp;
        if (!jumps.hasOwnProperty(tmpID)) {
          //jump table [address]
          jumps[tmpID] = [];
          grid[spot + 1][0] = "J"+tmp;
          break;
        }
      }
    }
  }

  else if (node.data[0] == "T_STRING") {
    console.log("STRING");
  }

  //TODO
  else if (node.data[0] == "T_ID") {
    console.log("ID");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 2) > 255 || grid[spot + 2].length > 0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      for (var id in stat) {
        if (stat.hasOwnProperty(id)) {
          for (f = node.data[3]; f >= 0; f--){
            if (stat[id][1] == node.data[1] && stat[id][2] == f) {
              grid[spot][0] = "T" + stat[id][0];
              grid[spot + 1][0] = "XX";
              break;
            }
          }
        }
      }
    }
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
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 2) > 255 || grid[spot + 2].length > 0) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "0" + node.data[1];
    }
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

/* 
function loadContents(s,n){
  var stat = s;
  var node = n;
  for (var id in stat) {
    if (stat.hasOwnProperty(id)) {
      if (stat[id][1] == node.children[0].data[1] && stat[id][2] == node.children[0].data[3]) {
        return true;
      }
    }
  }
} */

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
