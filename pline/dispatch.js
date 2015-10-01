var PLine = require("./pline.js");
var path = require("path");

function Dispatch(config) {
	this.folder = path.resolve(config.download);
	this.thread = config.thread;
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
	}).then(this.download.bind(this)).catch(function(error) { console.log(error) });
}
Dispatch.prototype.url = function(url) {
	return this.download([url]);
}
Dispatch.prototype.download = function(urls) {
	var self = this;
	return urls.filter(function(el) { return el.trim() !== "" })
		.forEach(function(url) {
			(new PLine(url, self.folder)).run();
		})
}

module.exports = function(config) { return new Dispatch(config) }