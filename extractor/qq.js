/*
var uuid = require("uuid");
var md5 = require("md5");
var xml2js = require('xml2js');
var bigInt = require("big-integer");
var iconv = require("iconv-lite");

var util = require("../util/util.js");

var playerPlatform = 11;
var playerVersion = '3.2.18.285';
var klibVersion = '2.0'

var checkTimeUrl = 'http://vv.video.qq.com/checktime';

var getVideoInfo = function (html){
	return eval("(" + html.match(/var\s+VIDEO_INFO\s?=\s?({[^}]+})/)[1] + ")");
};

var strsum = function (data){
	return parseInt(bigInt([].slice.call(data).reduce(function (s, el){
		return bigInt(s).multiply(131).add(el.charCodeAt());
	}, 0)).and(0x7fffffff).toString(), 10);
};

var repeat = function (val, times){
	var ret = [];

    for (var i = 0 ; i < times ; ++i){
    	ret = ret.concat([0x00]);
    }

    return ret;
}

var structPack = function (el){
	var getPack = function (el){
		if (Math.floor(el/256) < 1){
			return [el % 256];
		}
		else{
			return [el % 256].concat(getPack(Math.floor(el / 256)));
		}
	};

	var r = getPack(parseInt(el, 10));

	return [0, 1, 2, 3].map(function(node){
		return r[node] === undefined ? 0 : r[node];
	}).reverse();
};

var pack = function (data){
    return [].concat(structPack(data[0])).concat(structPack(data[1]));
};

var unpack = function (data){
	var pow256 = function (list){
		return [list.reduce(function(prev, curr, index){
			return prev + curr * Math.pow(256, 3-index);
		}, 0)];
	}

	return [].concat(pow256(data.slice(0, 4))).concat(pow256(data.slice(4, 8)));
};

var teaEncrypt = function (v, key){
	var delta = bigInt(0x9e3779b9), s = bigInt(0);

	v = unpack(v);

	v2 = v.map(function(el){
		return bigInt(el);
	});

	for (var i = 16; i > 0 ; --i){
		s = s.add(delta);
		s = s.and(0xffffffff);

	    v2[0] = v2[0].add(
	    			  v2[1].add(s)
	    			  .xor(v2[1].shiftRight(5).add(key[1]))
	    			  .xor(v2[1].shiftLeft(4).add(key[0]))
	    	    );

	    v2[0] = v2[0].and(0xffffffff);

	    v2[1] = v2[1].add(
    				v2[0].add(s)
    				.xor(v2[0].shiftRight(5).add(key[3]))
    				.xor(v2[0].shiftLeft(4).add(key[2]))
	    		);
        v2[1] = v2[1].and(0xffffffff);
	}

	v = v2.map(function (el){
		return parseInt(el.toString(), 10);
	});

	return pack(v);
};

var qqEncrypt = function (data, key){
	var temp = repeat(0x00, 8),
	    enc = teaEncrypt(data, key);

	for (var i = 8 ; i < data.length; i+=8){
		var d1 = data.slice(i).map(function(el){
			return bigInt(el);
		});

		for (var j = 0; j < 8; ++j){
			d1[j] = d1[j].xor(enc[i+j-8]);
		}

		d1 = d1.map(function(el){
			return el.valueOf();
		});

		d1 = teaEncrypt(d1, key).map(function(el){
			return bigInt(el);
		});

		for (var j = 0; j < d1.length; ++j){
			d1[j] = d1[j].xor(data[i+j-8]).xor(temp[j]).valueOf();
			enc.push(d1[j]);
			temp[j] = enc[i+j-8];
		}
	}

    return enc;
};

var ccc = function (timestamp){
    var key = [1735078436, 1281895718, 1815356193, 879325047],
        s1 = '537e6f0425c50d7a711f4af6af719e05d41d8cd98f00b204e9800998ecf8427e8afc2cf649f5c36c4fa3850ff01c1863d41d8cd98100b204e9810998ecf84271',
        d = [0x3039, 0x02, timestamp, playerPlatform, strsum(playerVersion), strsum(s1)],
        data = [0xa6, 0xf1, 0xd9, 0x2a, 0x82, 0xc8, 0xd8, 0xfe, 0x43];

    d.forEach(function (el){
		data = data.concat(structPack(el));
    });

    data = data.concat(repeat(0x00, 7));

    var enc = qqEncrypt(data, key);

	console.log(base64.encode("enc"));
};

var loadKey = function (){
	util.httpUtil.getHtml(checkTimeUrl).then(function (xml){
		return xml2js.parseString(xml, function (err, result){
			if (err){
//				return
			}

			return ccc(parseInt(result["root"]["t"][0], 10));
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

			return loadKey();
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
*/
var util = require("../util/util.js");

var api = "http://vv.video.qq.com/geturl?otype=json&vid=%s";

var getVideoInfo = function (content){
    var match1 = content.match(/vid\s*:\s*"\s*([^"]+)"/),
        match2 = content.match(/title\s*:\s*"\s*([^"]+)"/);

    return [match1[1], match2[1]];
};


var qq = function (){};

qq.prototype = {
		extract : function (url){
			return util.httpUtil.getHtml(url).then(function (html){
				var videoInfo = getVideoInfo(html),
				    url = api.replace(/%s/, videoInfo[0]);

				return util.httpUtil.getHtml(url).then(function (html){
					eval(html);

					var realUrl = QZOutputJson['vd']['vi'][0]['url'];

					return util.httpUtil.getUrlSize(realUrl).then(function(size){
						console.info(size);
						return {
							size : size,
							urls : [realUrl],
							title : videoInfo[1]
						};
					});
				});   
	        });
        }		    	
}
module.exports = qq;