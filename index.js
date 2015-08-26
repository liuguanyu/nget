#!node --harmony

var fs = require("fs");
var PLine = require("./pline/pline.js");

var promise = new Promise(function(resolve){
	if (process.stdin.isTTY){
		fs.readFile("download.txt", function (err, data){
			if (err) throw err;
			resolve(data.toString().split("\n"));
		});
	}
	else if (process.argv > 2) {
		resolve(process.argv.slice(2));
	}
	else {
		var data = "";
		process.stdin.resume(); // Compatible with "old" stream
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(chunk) {
			data += chunk.toString();
		});

		process.stdin.on('end', function() {
			resolve(data.split("\n"));
		});
	}
});

promise.then(function (downloadList) {
	downloadList.filter(function (el){
		return (el.trim() !== "");
	}).forEach(function (el){
		var pline = new PLine(el);
		pline.run();
	});
})