function clean(s){
	//removes whitespace (except newline) not in StringExpr
	var cleaner = s.replace(/[\r\t\f\v ]+(?=([^"]*"[^"]*")*[^"]*$)/g, "");
	var cleanest = cleaner.replace(/\/\*.*\*\//g, ""); //removes comments
	return cleanest;
}

//Token constructor
function Token(name, value){
	this.name = name;
	this.value = value;
}


// TODO: This function should create an ordered list of tokens 
// and return a String version of it
function lexer(s){
	str = clean(s);
	//var lastPosition
	return str; //should return a printed list per token
	//also errors and warnings
}