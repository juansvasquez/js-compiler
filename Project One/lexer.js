function clean(s){
	cleaner = s.replace(/\s/g, ""); //removes whitespace
	cleanest = cleaner.replace(/\/\*.*\*\//g, ""); //removes comments
	return cleanest;
}

function lexer(s){
	str = clean(s);
	return str;
}