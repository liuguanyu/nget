var headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Charset': 'UTF-8,*;q=0.5',
    'Accept-Encoding': 'gzip,deflate,sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:13.0) Gecko/20100101 Firefox/13.0'
};


var fs = require("fs");
var path = require("path");
var request = require('request');
var urlparse = require('url').parse;
var http = require('http');
var zlib = require('zlib');
var Download = require('download');

var httpUtil = {
	getHtml : function (url, userAgent, toString){
		if (userAgent){
			headers["User-Agent"] = userAgent;
		}

		if (toString === undefined){
			toString = true;
		}

		var opt = {
			'headers' : headers,
			'url' : url
		};

		return new Promise(function (resolve, reject){
			var req = request.get(opt);

			req.on('response', function(res) {
				var chunks = [];

				res.on('data', function(chunk) {
					chunks.push(chunk);
				});

				res.on('end', function() {
					var buffer = Buffer.concat(chunks);
					var encoding = res.headers['content-encoding'];

					if (encoding == 'gzip') {
						zlib.gunzip(buffer, function(err, decoded) {
							if (err){
								reject(err);
							}

							var ret = toString ? decoded.toString() : decoded;
							resolve(ret);
						});
					}
					else if (encoding == 'deflate') {
						zlib.inflate(buffer, function(err, decoded) {
							if (err){
								reject(err);
							}
							var ret = toString ? decoded.toString() : decoded;
							resolve(ret);
						});
					}
					else {
						var ret = toString ? buffer.toString() : buffer;
						resolve(ret);
					}
				});
			});
			req.on('error', function(err) {
				reject(err);
			});
		});
	},

	getUrlSize : function(url){
		var opt = {
			'headers' : headers,
			'url' : url
		};

		return new Promise(function (resolve, reject){
			var req = http.request(opt, function(res) {
				var resHeaders = res.headers;
			    if (headers['transfer-encoding'] != 'chunked'){
			        size = parseInt(headers['content-length'], 10);
			    }
			    else{
			        size = 0;
			    }

			    resolve(size);
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
			// url = "http://42.81.80.162:80/178/6/77/letv-uts/14/ver_00_22-1009154802-avc-3012372-aac-128000-2583200-1017852967-0c7735268d4b38883aa086810e01cef4-1449630661353_mp4/ver_00_22_149_710_2_13924032_1032162300.ts?mltag=1&platid=1&splatid=101&playid=0&geo=CN-1-0-1&tag=letv&ch=&p1=&p2=&p3=&tss=ios&b=3152&bf=29&nlh=3072&path=&sign=letv&proxy=709953101,1711200372,3683272603&uuid=&ntm=1450188000&keyitem=GOw_33YJAAbXYE-cnQwpfLlv_b2zAkYctFVqe5bsXQpaGNn3T1-vhw..&its=0&nkey2=858cbe1db8fa85cbde01aec61751a3f6&uid=3659428872.rp&qos=4&enckit=&m3v=1&token=&vid=&liveid=&station=&app_name=&app_ver=&fcheck=0";
		    
		 //    var urlinfo = urlparse(url);

		 //    var options = {
		 //        method: 'GET',
		 //        host: urlinfo.host,
		 //        path: urlinfo.pathname,
		 //        headers: headers
		 //    };

		 //    if(urlinfo.port) {
		 //        options.port = urlinfo.port;
		 //    }
		 //    if(urlinfo.search) {
		 //        options.path += urlinfo.search;
		 //    }

		 //    var req = http.request(options, function(res) {
		 //        var writestream = fs.createWriteStream(savefile);
		 //        writestream.on('close', function() {
		 //            resolve(res);
		 //        });
		 //        res.pipe(writestream);
		 //    });
		 //    req.end();
			new Download({mode: '755'})
			    .get(url)
			    .dest(path.dirname(savefile))
			    .rename(path.basename(savefile))
			    .run(function (){
			    	resolve();
			    });
		});
	},

	download : function (urls, downloadPostfix, workPath){
		if (typeof workPath === "undefined"){
			workPath = path.resolve(__dirname, '..', require("../config.json").download, (+new Date()) + '');
		}

		workPath = util.fsUtil.mkdir(workPath); // 如有重名，会改变

		var downloaders = urls.map(function (el, i){
			var file = path.resolve(workPath, '.', [i, ".", downloadPostfix].join(''));

			return (function (el){
				return util.downloadUtil
				   .downloadAndSave(el, file)
				   .then(function (data){
				   	   return {
				   	   	   path : workPath,
				   	   	   idx : i,
				   	   	   file : file
				   	   };
				   });
			})(el);
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