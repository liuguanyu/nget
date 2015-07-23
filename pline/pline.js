var getSiteNameByUrl = function (url){
	var match = url.match(/https?:\/\/([^\/]+)\//);

	if (match === null){
		throw new Exception("Error url!");
	}

	return match[1].split(".")[1];
};

var PLine = function (url){
	this.url = url;
}; 

PLine.prototype = {
	getExtractor : function (){
		var extractor = require("../extractor/" + getSiteNameByUrl(this.url) + ".js");
	
		this.extractor = new extractor();

		return this.extractor;
	},

	run : function (){
		this.getExtractor().extract(this.url).then(function (data){
			console.info(111);
			console.info(data);
		});
	}
};

module.exports = PLine;