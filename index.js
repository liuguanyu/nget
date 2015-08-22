var fs = require("fs");
var PLine = require("./pline/pline.js");

var downloadList= fs.readFileSync("download.txt").toString().split("\n");

downloadList.filter(function (el){
	return (el.trim() !== "");
}).forEach(function (el){
	var pline = new PLine(el);
	pline.run();	
});