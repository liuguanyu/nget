var util = require("../util/util.js");

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

	download : function (data){
		console.log("正在下载：" + data.title);
		console.log("总大小：" + util.spaceUtil.getSize(data.size));		
		console.log("分块数：" + data.urls.length);	

		return util.downloadUtil.download(data.urls);
	},

	transcode : function (data, postfix){ 
		var promises = []; 
		var transcoder = require("../transcoder/" + getSiteNameByUrl(this.url) + ".js");

		console.info(transcoder);

		data.forEach(function (el){
			promises.push(el.then(function (node){
				return transcoder.transcode(node);
			}));		
		});	

		return promises;									
	},

	clean : function (data){

	},

	run : function (){
		var self = this;

		this.getExtractor().extract(this.url).then(function (data){
			return self.download(data);	
		}).then(function (data){
			return self.transcode(data, "mov"); // 暂时只加mov
		}).then(function (data){
			self.clean(data);
		}).then(function (){
			console.log("任务完成");
		});
	}
};

module.exports = PLine;