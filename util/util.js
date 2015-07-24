var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:13.0) Gecko/20100101 Firefox/13.0'
};

var fs = require("fs");
var path = require("path");
var request = require('request');
var urlparse = require('url').parse;
var http = require('http');

var httpUtil = {
	getHtml : function (url){
		var opt = {
			'headers' : headers,
			'url' : url
		}

		return new Promise(function (resolve, reject){
			request(opt, function (err, response, body){
				if (err){
					reject(err);
				}	

				resolve(body);
			});
		});
	}
}

var spaceUtil = {
	getSize : function (size){
	    return size + "Bytes";
	}	
};

var fsUtil = {
	mkdir : function (dir){
		while (fs.existsSync(dir)){
	        dir = [dir, +new Date()].join("_");
	    }

	    fs.mkdirSync(dir);

	    return dir;
    }	 	

};

var downloadUtil = {
	downloadAndSave : function (url, savefile) {
		return new Promise(function (resolve, reject){
		    var urlinfo = urlparse(url);

		    var options = {
		        method: 'GET',
		        host: urlinfo.host,
		        path: urlinfo.pathname,
		        headers: headers
		    };

		    if(urlinfo.port) {
		        options.port = urlinfo.port;
		    }
		    if(urlinfo.search) {
		        options.path += urlinfo.search;
		    }

		    var req = http.request(options, function(res) {
		        var writestream = fs.createWriteStream(savefile);
		        writestream.on('close', function() {
		            resolve(res);
		        });
		        res.pipe(writestream);
		    });
		    req.end();
		});
	},

	download : function (urls, workPath){
		if (typeof workPath === "undefined"){
			workPath = path.resolve(__dirname, '..', (+new Date()) + '');
		}

		workPath = util.fsUtil.mkdir(workPath); // 如有重名，会改变

		var downloaders = urls.map(function (el, i){
			var file = path.resolve(workPath, '.', i + "");

			return util.downloadUtil
				   .downloadAndSave(el, file)
				   .then(function (data){
				   	   return {
				   	   	   path : workPath,
				   	   	   idx : i,
				   	   	   file : file
				   	   };
				   });
		
		});

		return downloaders;
	}
};

var util = {};

util.httpUtil = httpUtil;
util.spaceUtil = spaceUtil;
util.fsUtil = fsUtil;
util.downloadUtil = downloadUtil;

module.exports = util;