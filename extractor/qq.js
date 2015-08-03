var uuid = require("uuid");
var md5 = require("md5");
var xml2js = require('xml2js');

var util = require("../util/util.js");

var playerPlatform = 11;
var playerVersion = '3.2.18.285';
var klibVersion = '2.0'

var checkTimeUrl = 'http://vv.video.qq.com/checktime';

var getVideoInfo = function (html){
	return eval("(" + html.match(/var\s+VIDEO_INFO\s?=\s?({[^}]+})/)[1] + ")");
};

var strsum = function (data){
	s = 0
	for (var c in data) {
	    s = s*131 + ord(c)
	}
	return 0x7fffffff & s
};    

var ccc = function (timestamp){
    var key = [1735078436, 1281895718, 1815356193, 879325047],
        s1 = '537e6f0425c50d7a711f4af6af719e05d41d8cd98f00b204e9800998ecf8427e8afc2cf649f5c36c4fa3850ff01c1863d41d8cd98100b204e9810998ecf84271',
        d = [0x3039, 0x02, timestamp, playerPlatform, strsum(playerVersion), strsum(s1)],
        data = [0xa6, 0xf1, 0xd9, 0x2a, 0x82, 0xc8, 0xd8, 0xfe, 0x43];


};

var loadKey = function (){
	util.httpUtil.getHtml(checkTimeUrl).then(function (xml){
		xml2js.parseString(xml, function (err, result){
			if (err){
//				return 
			} 

			var t = parseInt(result["root"]["t"][0], 10);

			console.log(t);

			return t;
		});
	});
    // tree = ET.fromstring(get_content(url))
    // t = int(tree.find('./t').text)
    // return ccc(PLAYER_PLATFORM, PLAYER_VERSION, t)
};    

var qq = function (){};

qq.prototype = {
	extract : function (url){
		return util.httpUtil.getHtml(url).then(function (html){
			var videoInfo = getVideoInfo(html), params = {},
			    title = videoInfo["title"],
			    vid = videoInfo["vid"],
			    playerPid = uuid.v4().replace(/-/g, "").toUpperCase();

			loadKey();    
			    // params = {
			    //     "vids": vid,
			    //     "vid": vid,
			    //     "otype": "xml",
			    //     "defnpayver": 1,
			    //     "platform": playerPlatform,
			    //     "charge": 0,
			    //     "ran": Math.random(),
			    //     "speed": 8096, 
			    //     "pid": playerPid,
			    //     "appver": playerVersion,
			    //     "fhdswitch": 0,
			    //     "defn": "shd",  
			    //     "defaultfmt": "shd", 
			    //     "fp2p": 1,
			    //     "utype": 0,
			    //     "cKey": load_key(),
			    //     "encryptVer": klibVersion,		    	
			    // }

			// var uid = uuid.v4().replace(/-/g, ""),
			//     ids = getIdsByHtml(html);
			
			// return getVMS(ids[0], ids[1], uid).then(function (data){
			// 	return analyseVMSCode(data, url, uid).then(function(data){
			// 		return data;
			// 	});
			// });
		}, function (err){
			console.info(err);
		});	
	}
}

module.exports = qq;