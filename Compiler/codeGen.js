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
  if (spot > 255 || traversalGrid[spot].length > 0 || spot == -1) {
    traversalErrorMessage = "Code exceeds 256 bytes!";
    traversalErrors++;
  } else {
    traversalGrid[spot][0] = "00";
  }

  //backpatch jumps
  /* if (Object.keys(traversalJumpsTab).length === 0 && traversalJumpsTab.constructor === Object){
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
  } */

  //Begin Static Variable Area
  if (Object.keys(traversalStatTab).length === 0 && traversalStatTab.constructor === Object) {
    //no vars to backpatch
  } else {
    spot = spotFinderTD(traversalGrid);
    if (spot > 255 || traversalGrid[spot].length > 0 || spot == -1) {
      traversalErrorMessage = "Code exceeds 256 bytes!";
      traversalErrors++;
    } else {
      for (var id in traversalStatTab) {
        if (traversalStatTab.hasOwnProperty(id)) {
          console.log(id);
          //for every entry in the static table, we are saving a spot and marking its location
          spot = spotFinderTD(traversalGrid);
          traversalGrid[spot][0] = "00";
          var hexSpot = spot.toString(16);
          var hexy = "";
          for (var s = 0; s < hexSpot.length; s++) {
            hexy += hexSpot[s].toUpperCase();
          }
          if (hexy.length == 1){
            hexy = "0"+ hexy;
          }
          //save location in static table
          traversalStatTab[id].push(hexy);
          spot = spotFinderTD(traversalGrid);
          //now that we have a location, backpatch it into wherever we find a placeholder
          for (g = 0; g < spot; g++) {
            // if we find T/U#XX
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
  
  //console.log(traversalStatTab);

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
  var tempBool1 = "";
  var tempBool2 = "";

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
    if ((spot + 6) > 255 || grid[spot + 6].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[0].data[0] == "T_ID"){
        grid[spot][0] = "AC";
      } else if (node.children[0].data[0] == "T_DIGIT" || 
          node.children[0].data[0] == "T_STRING" || 
          node.children[0].data[0] == "T_TRUE" || 
          node.children[0].data[0] == "T_FALSE"){
        grid[spot][0] = "A0";
      } else {
      }
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "A2";

      if (node.children[0].data[0] == "T_STRING") {
        grid[spot + 1][0] = "02";
      } else if (node.children[0].data[0] == "T_ID"){
        var tid = "" + node.children[0].data[1] + node.children[0].data[3];
        for (var id in sym) {
          if (sym.hasOwnProperty(id)) {
            if (id == tid){
              if(sym[id][1] == "string"){
                grid[spot + 1][0] = "02";
                break;
              } else {
                grid[spot + 1][0] = "01";
                break;
              }
            }
          }
        } 
      } else {
        grid[spot + 1][0] = "01";
      }

      grid[spot + 2][0] = "FF";
    }
  }

  else if (node.data[0] == "Assignment Statement") {
    console.log("ASSIGN");
    var tempx;
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 6) > 255 || grid[spot + 6].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[1].data[0] == "T_DIGIT" ||
        node.children[1].data[0] == "T_STRING" ||
        node.children[1].data[0] == "T_TRUE" ||
        node.children[1].data[0] == "T_FALSE") {
        grid[spot][0] = "A9";
      } else if (node.children[1].data[0] == "T_ID"){
        grid[spot][0] = "AD";
      } else if (node.children[1].data[0] == "Add") {
        grid[spot][0] = "AD";
        
        package = traversal(node.children[0], grid, sym, stat, jumps);
        grid = package[0];
        stat = package[1];
        jumps = package[2];
        errors += package[3];
        errorM = package[4];

        grid[spot][0] = "8D";

        for (var temp = 0; temp < 10; temp++) {
          var tmpID = "S" + temp + "X" + "X";
          if (!stat.hasOwnProperty(tmpID)) {
            //static table [id,placeholder,placeholder]
            stat[tmpID] = [temp, "ASSADD", 0];
            spot = spotFinderTD(grid);
            grid[spot][0] = "S" + temp;
            grid[spot + 1][0] = "XX";
            tempx = "S" + temp;
            break;
          }
        }
      } else {

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
    if ((spot + 5) > 255 || grid[spot + 5].length > 0 || spot == -1){
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
      for (var temp = 0; temp < 10; temp++){
        var tmpID = "T"+temp+"X"+"X";
        if (!stat.hasOwnProperty(tmpID)){
          //static table [keypart,id,scope,address]
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
    var tempo = "";
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 13) > 255 || grid[spot + 13].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[0].data[0] != "Boolean Expression") {
        grid[spot][0] = "A9";
      } else {
      }

      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];
      tempBool1 = package[5];
      tempBool2 = package[6];

      if (node.children[0].data[0] != "Boolean Expression") {
        spot = spotFinderTD(grid);
        grid[spot][0] = "8D";
      }

      if (node.children[0].data[0] != "Boolean Expression") {
        for (var temp = 0; temp < 10; temp++) {
          var tmpID = "W" + temp + "X" + "X";
          if (!stat.hasOwnProperty(tmpID)) {
            //static table [id,placeholder,placeholder]
            stat[tmpID] = [temp, "WHILE", 0];
            spot = spotFinderTD(grid);
            grid[spot][0] = "W" + temp;
            grid[spot + 1][0] = "XX";
            tempo = "W" + temp;
            break;
          }
        }
      }

      if (node.children[0].data[0] != "Boolean Expression") {
        spot = spotFinderTD(grid);
        grid[spot][0] = "A2";
        grid[spot + 1][0] = "01";
        grid[spot + 2][0] = "EC";
        grid[spot + 3][0] = tempo;
        grid[spot + 4][0] = "XX";
      }

      spot = spotFinderTD(grid);
      grid[spot][0] = "A9";
      grid[spot+1][0] = "00";
      grid[spot+2][0] = "D0";
      grid[spot+3][0] = "02";
      grid[spot+4][0] = "A9";
      grid[spot+5][0] = "01";
      grid[spot+6][0] = "A2";
      grid[spot+7][0] = "00";

      if (node.children[0].data[0] != "Boolean Expression") {
        spot = spotFinderTD(grid);
        grid[spot][0] = "8D";
        grid[spot + 1][0] = tempo;
        grid[spot + 2][0] = "XX";
        grid[spot + 3][0] = "EC";
        grid[spot + 4][0] = tempo;
        grid[spot + 5][0] = "XX";
      }

      if (node.children[0].data[0] == "Boolean Expression") {
        spot = spotFinderTD(grid);
        grid[spot][0] = "8D";
        grid[spot + 1][0] = tempBool1;
        grid[spot + 2][0] = "XX";
        grid[spot + 3][0] = "EC";
        grid[spot + 4][0] = tempBool2;
        grid[spot + 5][0] = "XX";
      }

      spot = spotFinderTD(grid);
      grid[spot][0] = "D0";

      for (var tmp = 0; tmp < 10; tmp++) {
        var tmpID = "J" + tmp;
        if (!jumps.hasOwnProperty(tmpID)) {
          //jump table [address]
          jumps[tmpID] = [];
          grid[spot + 1][0] = "J" + tmp;
          break;
        }
      }

      package = traversal(node.children[1], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      if (Object.keys(jumps).length === 0 && jumps.constructor === Object) {
        //no jumps to backpatch
      } else {
        for (var id in jumps) {
          if (jumps.hasOwnProperty(id)) {
            //find the key in the table
            for (g = 0; g < grid.length; g++) {
              if (grid[g][0] == id) {
                var dist = spot - g;
                //console.log(dist);
                jumps[id][0] = dist;
                var newDist = dist.toString(16);
                //console.log(newDist);
                if (newDist.length == 1) {
                  grid[g][0] = "0" + newDist;
                } else {
                  grid[g][0] = newDist;
                }
              }
            }
          }
        }
      }
    }
  }

  else if (node.data[0] == "If Statement") {
    console.log("IF");
    var tempo = "";
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 13) > 255 || grid[spot + 13].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[0].data[0] != "Boolean Expression") {
        grid[spot][0] = "A9";
      } else {
      }

      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      if (node.children[0].data[0] != "Boolean Expression") {
        spot = spotFinderTD(grid);
        grid[spot][0] = "8D";
      }

      if (node.children[0].data[0] != "Boolean Expression") {
        for (var temp = 0; temp < 10; temp++) {
          var tmpID = "V" + temp + "X" + "X";
          if (!stat.hasOwnProperty(tmpID)) {
            //static table [id,placeholder,placeholder]
            stat[tmpID] = [temp, "IF", 0];
            spot = spotFinderTD(grid);
            grid[spot][0] = "V" + temp;
            grid[spot+1][0] = "XX";
            tempo = "V" + temp;
            break;
          }
        }
      }

      if (node.children[0].data[0] != "Boolean Expression") {
        spot = spotFinderTD(grid);
        grid[spot][0] = "A2";
        grid[spot+1][0] = "01";
        grid[spot + 2][0] = "EC";
        grid[spot + 3][0] = tempo;
        grid[spot + 4][0] = "XX";
      }

      spot = spotFinderTD(grid);
      grid[spot][0] = "D0";

      for (var tmp = 0; tmp < 10; tmp++) {
        var tmpID = "J" + tmp;
        if (!jumps.hasOwnProperty(tmpID)) {
          //jump table [address]
          jumps[tmpID] = [];
          grid[spot + 1][0] = "J" + tmp;
          break;
        }
      }

      package = traversal(node.children[1], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      if (Object.keys(jumps).length === 0 && jumps.constructor === Object) {
        //no jumps to backpatch
      } else {
        for (var id in jumps) {
          if (jumps.hasOwnProperty(id)) {
            //find the key in the table
            for (g = 0; g < grid.length; g++) {
              if (grid[g][0] == id) {
                var dist = spot - g;
                //console.log(dist);
               jumps[id][0] = dist;
                var newDist = dist.toString(16);
                //console.log(newDist);
                if (newDist.length == 1) {
                  grid[g][0] = "0" + newDist;
                } else {
                  grid[g][0] = newDist;
                }
              }
            }
          }
        }
      }
    }
  }

  else if (node.data[0] == "Add") {
    console.log("ADD");
    spot = spotFinderTD(grid);
    var tempy1 = "";
    var tempy2 = "";
    var tempy3 = "";
    //check if we have space
    if ((spot + 13) > 255 || grid[spot + 13].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[0].data[0] == "T_DIGIT") {
        grid[spot][0] = "A9";
      } else {
        grid[spot][0] = "AD";
      }
      //get location if var, value if int
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "8D";

      //create new temp address
      for (var temp = 0; temp < 10; temp++) {
        var tmpID = "U" + temp + "X" + "X";
        if (!stat.hasOwnProperty(tmpID)) {
          //static table [id,placeholder,placeholder]
          stat[tmpID] = [temp, "ADD", 0];
          grid[spot + 1][0] = "U" + temp;
          grid[spot + 2][0] = "XX";
          tempy1 = "U" + temp;
          break;
        }
      }

      spot = spotFinderTD(grid);
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

      for (var temp = 0; temp < 10; temp++) {
        var tmpID = "Z" + temp + "X" + "X";
        if (!stat.hasOwnProperty(tmpID)) {
          //static table [id,placeholder,placeholder]
          stat[tmpID] = [temp, "ADD", 0];
          grid[spot + 1][0] = "Z" + temp;
          grid[spot + 2][0] = "XX";
          tempy2 = "Z" + temp;
          break;
        }
      }

      spot = spotFinderTD(grid);
      grid[spot][0] = "A9";
      grid[spot+1][0] = "00";
      grid[spot+2][0] = "6D";
      grid[spot+3][0] = tempy2;
      grid[spot+4][0] = "XX";
      grid[spot+5][0] = "6D";
      grid[spot+6][0] = tempy1;
      grid[spot+7][0] = "XX";
      grid[spot+8][0] = "8D";

      for (var temp = 0; temp < 10; temp++) {
        var tmpID = "U" + temp + "X" + "X";
        if (!stat.hasOwnProperty(tmpID)) {
          //static table [id,placeholder,placeholder]
          stat[tmpID] = [temp, "ADD", 0];
          grid[spot + 9][0] = "U" + temp;
          grid[spot + 10][0] = "XX";
          tempy3 = "U" + temp;
          break;
        }
      }

      spot = spotFinderTD(grid);
      grid[spot][0] = "AC";
      grid[spot+1][0] = tempy3;
      grid[spot+2][0] = "XX";
      
    }
  }

  else if (node.data[0] == "Boolean Expression") {
    console.log("BOOLEXPR");
    var tempr = "";
    var templ = "";
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 17) > 255 || grid[spot + 17].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      if (node.children[0].data[0] == "T_DIGIT" ||
        node.children[0].data[0] == "T_STRING" ||
        node.children[0].data[0] == "T_TRUE" ||
        node.children[0].data[0] == "T_FALSE") {
        grid[spot][0] = "A9";
      } else if (node.children[0].data[0] == "T_ID"){
        grid[spot][0] = "AD";
      } else {
      }
      
      //ISSUE
      package = traversal(node.children[0], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "8D";

      for (var temp = 0; temp < 10; temp++) {
        var tmpID = "X" + temp + "X" + "X";
        if (!stat.hasOwnProperty(tmpID)) {
          //static table [id,placeholder,placeholder]
          stat[tmpID] = [temp, "BOOLEXPR", 0];
          grid[spot + 1][0] = "X" + temp;
          grid[spot + 2][0] = "XX";
          tempr = "X" + temp;
          break;
        }
      }

      spot = spotFinderTD(grid);
      if (node.children[2].data[0] == "T_DIGIT" ||
        node.children[2].data[0] == "T_STRING" ||
        node.children[2].data[0] == "T_TRUE" ||
        node.children[2].data[0] == "T_FALSE") {
        grid[spot][0] = "A9";
      } else if (node.children[0].data[0] == "T_ID") {
        grid[spot][0] = "AD";
      } else {
      }

      package = traversal(node.children[2], grid, sym, stat, jumps);
      grid = package[0];
      stat = package[1];
      jumps = package[2];
      errors += package[3];
      errorM = package[4];

      spot = spotFinderTD(grid);
      grid[spot][0] = "8D";

      for (var temp = 0; temp < 10; temp++) {
        var tmpID = "Y" + temp + "X" + "X";
        if (!stat.hasOwnProperty(tmpID)) {
          //static table [id,placeholder,placeholder]
          stat[tmpID] = [temp, "BOOLEXPR", 0];
          grid[spot + 1][0] = "Y" + temp;
          grid[spot + 2][0] = "XX";
          templ = "Y" + temp;
          break;
        }
      }

      spot = spotFinderTD(grid);
      grid[spot][0] = "AE";
      grid[spot+1][0] = tempr;
      grid[spot+2][0] = "XX";
      grid[spot+3][0] = "EC";
      grid[spot+4][0] = templ;
      grid[spot+5][0] = "XX";

      tempBool1 = tempr;
      tempBool2 = templ;
    }
  }

  else if (node.data[0] == "T_ID") {
    console.log("ID");
    spot = spotFinderTD(grid);
    //check if we have space
    if ((spot + 2) > 255 || grid[spot + 2].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      for (var id in stat) {
        if (stat.hasOwnProperty(id)) {
          for (var f = node.data[3]; f >= 0; f--){
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

  /* else if (node.data[0] == "T_VAR_TYPE_INT") {
    console.log("TYPEINT");
  }

  else if (node.data[0] == "T_VAR_TYPE_STRING") {
    console.log("TYPESTRING");
  }

  else if (node.data[0] == "T_VAR_TYPE_BOOLEAN") {
    console.log("TYPEBOOL");
  } */

  else if (node.data[0] == "T_DIGIT") {
    console.log("DIGIT");
    spot = spotFinderTD(grid);
    //check if we have space
    if (spot > 255 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "0" + node.data[1];
    }
  }

  else if (node.data[0] == "T_STRING") {
    console.log("STRING");
    var thisString = node.data[1];
    var strLength = thisString.length;
    spot = spotFinderBU(grid);
    //check if we have space
    if (grid[spot - strLength].length > 0 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "00";
      spot = spotFinderBU(grid);
      spot = spot - (strLength-1);
      for (var n = 0, l = strLength; n < l; n++) {
        var hex = thisString.charCodeAt(n).toString(16);
        var hexy = "";
        for (var s = 0; s < hex.length; s++){
          hexy += hex[s].toUpperCase();
        }
        grid[spot+n][0] = [hexy];
      }
      spot = spotFinderBU(grid);
      var newSpot = spot+1;
      spot = spotFinderTD(grid);
      grid[spot][0] = newSpot.toString(16).toUpperCase();
    }
  }

  /* else if (node.data[0] == "T_EQ") {
    console.log("==");
  }

  else if (node.data[0] == "T_INEQ") {
    console.log("!=");
  } */

  else if (node.data[0] == "T_TRUE") {
    console.log("TRUE");
    spot = spotFinderTD(grid);
    //check if we have space
    if (spot > 255 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "01";
    }
  }

  else if (node.data[0] == "T_FALSE") {
    console.log("FALSE");
    spot = spotFinderTD(grid);
    //check if we have space
    if (spot > 255 || spot == -1) {
      errorM = "Code exceeds 256 bytes!";
      errors++;
    } else {
      grid[spot][0] = "00";
    }
  }

  var traversalReturn = [grid, stat, jumps, errors, errorM,tempBool1,tempBool2];
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

//transforms strings into hex
function A2H(str) {
  var array = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    array.push(hex);
  }
  return array.join("").toUpperCase();
}

//console.log(A2H("alan"));