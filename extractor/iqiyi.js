var postfix = "f4v";
var uuid = require("uuid");
var md5 = require("md5");

var util = require("../util/util.js");

var mix = function (tvid){
    var enc = [], src="eknas", tm = Math.floor(Math.random() * (4000 - 2000) + 2000);
    
    enc.push("8ed797d224d043e7ac23d95b70227d32");
	enc.push(tm);
	enc.push(tvid);

	return [tm, md5(enc.join("")), src];
};


var getVMS = function (tvid, vid, uid){
	var params = mix(tvid);

	var vmsreq = "http://cache.video.qiyi.com/vms?key=fvip&src=1702633101b340d8917a69cf8a4b8c7";

     vmsreq += "&tvId=" + tvid + "&vid=" + vid + "&vinfo=1&tm=" + params[0];
     vmsreq += "&enc=" + params[1];
     vmsreq += "&qyid=" + uid + "&tn=" + Math.random() +"&um=1";
     vmsreq += "&authkey=" + md5([params[0], tvid].join(''));

     return util.httpUtil.getHtml(vmsreq);
};

var getIdsByHtml = function (html, url){
	var match1 = html.match(/data-player-tvid="(.*?)"/) || url.match(/tvid=(.*?)&/ ),
		match2 = html.match(/data-player-videoid="(.*?)"/) || url.match(/vid=(.*?)&/);

	return [match1[1], match2[1]];
};

var getVRSXORCode = function (arg1, arg2){
	return arg1 ^ ([103, 121, 72][arg2 % 3]);
};

var getVrsEncodeCode = function (vlink){
	var loc6 = 0, loc2 = "",
	    loc3 = vlink.split("-"), loc4 = loc3.length;

	for(var i = loc4 - 1; i > -1; --i){
		loc6 = getVRSXORCode(parseInt(loc3[loc4 - i - 1], 16), i);
		loc2 += 	String.fromCharCode(loc6);
	}

	return loc2.split('').reverse().join('');
};

var getVLnksByVMS = function (info){
	if (info["data"]['vp']["tkl"] == ""){
		// 有误
	}

	var bid = 0, vlnks;

	info["data"]["vp"]["tkl"][0]["vs"].forEach(function (el, i){
	    var elBid = parseInt(el["bid"], 10);

	    if ((elBid <= 10) && (elBid >= bid)){
	    		bid = elBid;

	    		vlnks = el["fs"];

	    		if (el["fs"][0]["l"][0] != "/"){
	    			if (getVrsEncodeCode(el["fs"][0]["l"]).substr(-3) == "mp4"){
	    				vlnks = el["flvs"]
	    			}
	    		}
	    }
	});

	return vlnks;
};

var getDispathKey = function (rid){
	var url = "http://data.video.qiyi.com/t?tn=" + Math.random();

	return util.httpUtil.getHtml(url).then(function (data){
		var tp = ")(*&^flash@#$%a";  // swf 里面的处理
		var t  = Math.floor((JSON.parse(data)["t"])/6e2);

		return md5(t + tp + rid);
	});
};

var analyseVMSCode = function(data, url, uid){
	var info = JSON.parse(data),
	    title = info["data"]["vi"]["vn"],
	    urls, vLnks = getVLnksByVMS(info);

	urls = vLnks.map(function (el, i){
		vlink = el["l"];

        if (vlink[0] != "/"){ //编码过的
            vlink = getVrsEncodeCode(vlink);
        }

        return (function (vlink){
    		return getDispathKey(vlink.split("/").pop().split(".")[0]).then(function(data){
        		var baseUrlInfo, baseUrl, url;

        		baseUrlInfo = info["data"]["vp"]["du"].split("/");
        		baseUrlInfo.splice(-1, 0 , data);
        		baseUrl = baseUrlInfo.join("/");

        		url = baseUrl + vlink + '?su=' + uid + '&qyid=' + uuid.v4().replace(/-/g, "");
        		url += '&client=&z=&bt=&ct=&tn=' + (Math.floor(Math.random() * (20000 - 10000) + 10000));

        		return util.httpUtil.getHtml(url).then(function (data){
        			return {
        				link : JSON.parse(data)["l"],
        				size : el["b"]
        			};
        		});
    		});
        })(vlink);
	});

	return Promise.all(urls).then(function(){
		var size = 0, us = [], rets = {};

		for (var i in arguments){
			for(var j in arguments[i]){
				size += arguments[i][j].size;
				us.push(arguments[i][j].link);
			}
		}

		rets = {
			size : size,
			urls : us,
			title : title
		};

		return rets;
	});
};

var iqiyi = function (){};

iqiyi.prototype = {
	extract : function (url){
		return util.httpUtil.getHtml(url).then(function (html){
			var uid = uuid.v4().replace(/-/g, ""),
			    ids = getIdsByHtml(html);

			return getVMS(ids[0], ids[1], uid).then(function (data){
				return analyseVMSCode(data, url, uid).then(function(data){
					data.site_postfix = postfix;
					return data;
				});
			});
		}, function (err){
			console.info(err);
		});
	}
};

module.exports = iqiyi;
