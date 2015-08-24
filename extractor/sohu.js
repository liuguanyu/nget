var postfix = "mp4";
var util = require("../util/util.js");
var urlparse = require('url').parse;

var dealWithVideoInfo = function (info){
	info["host"] = info['allot'];
	info["title"] = info['data']['tvName'];
	info["size"] =  info['data']['clipsBytes'].reduce(function (previous, current){
		return previous + parseInt(current, 10);
	});

	return info;
}

var getRealUrl = function (host, vid, tvid, newClip, clip, ck){
	var clipURL = urlparse(clip).path;
    var url = 'http://' + host + '/?prot=9&prod=flash&pt=1&file=' + clipURL + '&new=' + newClip + '&key=' + ck + '&vid=' + vid + '&uid=' + (+(new Date())) + '&t=' + Math.random();

	return util.httpUtil.getHtml(url).then(function(data){
		return JSON.parse(data)["url"];
	});
}

var getRealUrls = function (info){
	var data = info.data;

	return data["su"].reduce(function (prev, current, idx){
		var newClip = current, clip = data['clipsURL'][idx], ck = data['ck'][idx];
		prev.push(getRealUrl(info["host"], info["vid"], info["tvid"], newClip, clip, ck));

		return prev;
	}, []);
}

var getVidByUrl = function (url){
	return new Promise(function (resolve, reject){
		if (/http:\/\/share.vrs.sohu.com/.test(url)){
			resolve(url.match(/id=(\d+)/)[1]);
		}

		return util.httpUtil.getHtml(url).then(function(data){
			resolve(data.match(/\Wvid\s*[\:=]\s*[\'"]?(\d+)[\'"]?/)[1]);
		});
	});
}

var getVideoInfo = function (type, vid){
	var prefixUrl = {
		"tv" : "http://hot.vrs.sohu.com/vrs_flash.action?vid=%s",
		"not_tv" : "http://my.tv.sohu.com/play/videonew.do?vid=%s&referer=http://my.tv.sohu.com"
	}, url = prefixUrl[type].replace(/%s/, vid);

	return util.httpUtil.getHtml(url).then(function (data){
		var info = dealWithVideoInfo(JSON.parse(data));

		info.vid = vid;
		return Promise.all(getRealUrls(info)).then(function(){
			info.urls = arguments[0];
			info.site_postfix = postfix;

			return info;
		});
	});
}

var sohu = function (){};

sohu.prototype = {
	extract : function (url){
		return getVidByUrl(url).then(function (vid){
			if (/http:\/\/tv.sohu.com\//.test(url)){
				return getVideoInfo("tv", vid);
			}
			else{
				return getVideoInfo("not_tv", vid);
			}
		});
	}
};

module.exports = sohu;