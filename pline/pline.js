var util = require("../util/util.js");
var path = require("path");
var rimraf = require("rimraf");

var getSiteNameByUrl = function (url){
	var match = url.match(/https?:\/\/([^\/]+)\//);

	if (match === null){
		throw new Exception("Error url!");
	}

	var siteInfo = match[1].split(".");
	
	return siteInfo[siteInfo.length - 2];
};

var PLine = function (url, folder){
	this.url = url;
	this.workPath = folder;
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

		return util.downloadUtil.download(data.urls, data.site_postfix);
	},

	transcode : function (data, postfix){
		var self = this;
		var promises = [];
		var transcoder = require("../transcoder/" + getSiteNameByUrl(this.url) + ".js");

		data.forEach(function (el){
			promises.push(el.then(function (node){
				return transcoder.transcode(node);
			}));
		});

		return Promise.all(promises).then(function (){
			var rets = [];
			
			arguments[0].forEach(function(el){
				rets.push(el);
			});

			var finalFile = path.resolve( self.workPath, [self.title, postfix].join("."));
			return transcoder.mergeAndTranscode(rets, finalFile);
		});
	},

	clean : function (data){
		console.log("下载文件到：" + data.finalFile);

		return new Promise(function (resolve, reject){
		    rimraf(data.workPath, function (){
				resolve();
		    });
		});
	},

	run : function (){
		var self = this;

		this.getExtractor().extract(this.url).then(function (data){
			self.title = data.title;
			return self.download(data);
		}).then(function (data){
			return self.transcode(data, "mp4"); // 暂时只加mov
		}).then(function (data){
			self.clean(data);
		}).then(function (data){
			console.log("任务完成");
		}).catch(function (err){
			console.log(err.stack);
		});
	}
};

module.exports = PLine;