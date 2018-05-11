function codeGen(t, o){
  var ast = t;
  var symTab = o;
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
  traversalSymTab = traversalResults[1];
  traversalStatTab = traversalResults[2];
  traversalJumpsTab = traversalResults[3];
  traversalErrors = traversalResults[4];

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

  var traversalReturn = [grid, sym, stat, jumps, errors,errorM];
  return traversalReturn;
}
