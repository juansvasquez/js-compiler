class Node {
  constructor(data) {
    this.data = data;
    this.children = [];
  }
}

class Tree {
  constructor() {
    this.root = null;
  }
  add(data, toNodeData) {
    var node = new Node(data); //creates a new node
    var parent = toNodeData ? this.find(toNodeData) : null; //parent becomes either true/false or null (false)
    if (parent) {
      parent.children.push(node);
    }
    else {
      if (!this.root) {
        this.root = node;
      }
      else {
        return 'Root node is already assigned';
      }
    }
  }
  contains(data) {
    return this.find(data) ? true : false; //if we get a null, it's false
  }
  find(data) {
    var queue = [this.root];
    while (queue.length) {
      var node = queue.shift();
      if (this.checkArrs(node.data, data)) {
        return node;
      }
      for (var i = 0; i < node.children.length; i++) {
        queue.push(node.children[i]);
      }
    }
    return null;
  }

  checkArrs(arr1, arr2) {
    if (arr1.length !== arr2.length)
      return false;
    for (var i = arr1.length; i--;) {
      if (arr1[i] !== arr2[i])
        return false;
    }
    return true;
  }
}

//var tree = new Tree();

/*
{
string b
{
int a
a = 1
}
b = "hello"
}$
*/

/*
tree.add(["BLOCK", 0, 1]);

tree.add(["Variable Declaration", 0, 2], ["BLOCK", 0, 1]);
tree.add(["T_VAR_TYPE_STRING", "string", 2],["Variable Declaration", 0, 2]);
tree.add(["T_ID", "b", 2], ["Variable Declaration", 0, 2]);

tree.add(["BLOCK", 1, 3],["BLOCK", 0, 1]);

tree.add(["Variable Declaration", 1, 4], ["BLOCK", 1, 3]);
tree.add(["T_VAR_TYPE_INT", "int", 4], ["Variable Declaration", 1, 4]);
tree.add(["T_ID", "a", 4], ["Variable Declaration", 1, 4]);

tree.add(["Assignment Statement", 1, 5], ["BLOCK", 1, 3]);
tree.add(["T_ID", "a", 5], ["Assignment Statement", 1, 5]);
tree.add(["T_DIGIT", 1, 5], ["Assignment Statement", 1, 5]);

tree.add(["Assignment Statement", 1, 7], ["BLOCK", 0, 1]);
tree.add(["T_ID", "b", 7], ["Assignment Statement", 1, 7]);
tree.add(["String Expression", "hello", 7], ["Assignment Statement", 1, 7]);

//console.log(tree.root.children[0].data);
*/

//STATEMENTS: [NAME, LINE NUMBER, SCOPE]
//TOKENS: [NAME, VALUE, LINE NUMBER, SCOPE]
//*NO CHAR TOKENS IN THE AST*