var uuid = require("uuid");
var md5 = require("md5");

var util = require("../util/util.js");

var mix = function (tvid){
    var enc = [], src="hsalf", tm = Math.floor(Math.random() * (4000 - 2000) + 2000);
    	enc.push("8e29ab5666d041c3a1ea76e06dabdffb");
	enc.push(tm);
	enc.push(tvid);

	return [tm, md5(enc.join("")), src];
};

var getVMS = function (tvid, vid, uid){
	var params = mix(tvid);

	var vmsreq = "http://cache.video.qiyi.com/vms?key=fvip&src=1702633101b340d8917a69cf8a4b8c7";

     vmsreq += "&tvId=" + tvid + "&vid=" + vid + "&vinfo=1&tm=" + params[0];
     vmsreq += "&enc=" + params[1];
     vmsreq += "&qyid=" + uid + "&tn=" + Math.random() +"&um=0";
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
		var t  = Math.floor((JSON.parse(data)["t"])/6e2)

		return md5(t + tp + rid);
	});
};

var iqiyi = function (){};

iqiyi.prototype = {
	extract : function (url){
		return util.httpUtil.getHtml(url).then(function (html, url){
			var uid = uuid.v4().replace(/-/g, ""),
			    ids = getIdsByHtml(html);
			
			return getVMS(ids[0], ids[1], uid).then(function(data){
				var info = JSON.parse(data),
				    title = info["data"]["vi"]["vn"],
				    urls = [],
    					size = 0,
				    vLnks = getVLnksByVMS(info);

				vLnks.forEach(function (el, i){
					vlink = el["l"];

			        if (vlink[0] != "/"){ //编码过的
			            vlink = getVrsEncodeCode(vlink);
			        }

			        return getDispathKey(vlink.split("/").pop().split(".")[0]).then(function(data){
			        		// size += el["b"];

			        		var baseUrlInfo, baseUrl, url;

			        		baseUrlInfo = info["data"]["vp"]["du"].split("/");			        		
			        		baseUrlInfo.splice(-1, 0 , data);
			        		baseUrl = baseUrlInfo.join("/");

			        		url = baseUrl + vlink + '?su=' + uid + '&qyid=' + uuid.v4().replace(/-/g, "")
			        		url += '&client=&z=&bt=&ct=&tn=' + (Math.floor(Math.random() * (20000 - 10000) + 10000));

			        		return util.httpUtil.getHtml(url).then(function (data){
			        			urls.push(JSON.parse(data)["l"]);

			        			return urls;
			        		});
			        });
				});
  
			});
		});
	}
}

module.exports = iqiyi;