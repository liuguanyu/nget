var PLine = require("./pline.js");

function Dispatch(folder, thread) {
	this.folder = folder;
	this.thread = thread;
}
Dispatch.prototype.pipe = function() {
	return new Promise(function(resolve) {
		var data = "";
		process.stdin.resume(); //Compatible with old stream
		process.stdin.setEncoding("utf-8");
		process.stdin.on("data", function(chunk) { data += chunk.toString() });
		process.stdin.on("end", function() { resolve(data.split("\n")) });
	}).then(this.download);
}
Dispatch.prototype.file = function(file) {
	return new Promise(function(resolve, reject) {
		require("fs").readFile(file, function(err, data) {
			if(err) reject(err);
			resolve(data.toString().split("\n"));
		})
	}).then(this.download).catch(function(error) { console.log(error) });
}
Dispatch.prototype.url = function(url) {
	return this.download([url]);
}
Dispatch.prototype.download = function(urls) {
	return urls.filter(function(el) { return el.trim() !== "" })
		.forEach(function(url) {
			(new PLine(url)).run();
		})
	// 	.map(function(url) { return new PLine(url) })
	// 	.reduce(function(seq, el) {
	// 	return seq.then(function() {
	// 		el.run()
	// 	})
	// }, Promise.resolve()).then(function() {
	// 	console.log("下载完毕");
	// });
}

module.exports = function(folder, thread) { return new Dispatch(folder, thread) }