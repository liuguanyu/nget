var uuid = require("uuid");
var md5 = require("md5");

var util = require("../util/util.js");

var mix = function (tvid){
    var enc = [], src="hsalf", tm = Math.floor(Math.random() * (4000 - 2000)) + 2000;
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

var iqiyi = function (){};

iqiyi.prototype = {
	extract : function (url){
		return util.httpUtil.getHtml(url).then(function (html, url){
			var uid = uuid.v4().replace(/-/g, ""),
			    ids = getIdsByHtml(html);
			
			return getVMS(ids[0], ids[1], uid).then(function(data){
				return this.resolve(data);	
			});
		});
	}
}

module.exports = iqiyi;