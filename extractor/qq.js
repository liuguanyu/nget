var uuid = require("uuid");
var md5 = require("md5");
var xml2js = require('xml2js');
var bigInt = require("big-integer");

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

var tea_encrypt = function (v, key){
    // delta = 0x9e3779b9
    // s = 0
    // v = unpack(v)
    // rounds = 16
    // while rounds:
    //     s += delta
    //     s &= 0xffffffff
    //     v[0] += (v[1]+s) ^ ((v[1]>>5)+key[1]) ^ ((v[1]<<4)+key[0])
    //     v[0] &= 0xffffffff
    //     v[1] += (v[0]+s) ^ ((v[0]>>5)+key[3]) ^ ((v[0]<<4)+key[2])
    //     v[1] &= 0xffffffff
    //     rounds = rounds - 1
    // return pack(v)
};

var qqEncrypt = function (data, key){
    // temp = [0x00]*8
    // enc = tea_encrypt(data, key)
    // for i in range(8, len(data), 8):
    //     d1 = data[i:]
    //     for j in range(8):
    //         d1[j] = d1[j] ^ enc[i+j-8]
    //     d1 = tea_encrypt(d1, key)
    //     for j in range(len(d1)):
    //         d1[j] = d1[j]^data[i+j-8]^temp[j]
    //         enc.append(d1[j])
    //         temp[j] = enc[i+j-8]
    // return enc
    var enc = '';
    return enc;
};

var ccc = function (timestamp){
    var key = [1735078436, 1281895718, 1815356193, 879325047],
        s1 = '537e6f0425c50d7a711f4af6af719e05d41d8cd98f00b204e9800998ecf8427e8afc2cf649f5c36c4fa3850ff01c1863d41d8cd98100b204e9810998ecf84271',
        d = [0x3039, 0x02, timestamp, playerPlatform, strsum(playerVersion), strsum(s1)],
        data = [0xa6, 0xf1, 0xd9, 0x2a, 0x82, 0xc8, 0xd8, 0xfe, 0x43];

        d.forEach(function (el){
    		var getPack = function (el){
    			if (Math.floor(el/256) < 1){
    				return [el % 256];
    			}
    			else{
    				return [el % 256].concat(getPack(Math.floor(el / 256)));
    			}
    		};

    		var r = getPack(parseInt(el, 10));

    		var ret = [0, 1, 2, 3].map(function(node){
    			return r[node] === undefined ? 0 : r[node];
    		}).reverse();

    		data = data.concat(ret);
        });

        for (var i = 0 ; i < 7 ; ++i){
        	data = data.concat([0x00]);
        }

        var enc = qqEncrypt(data, key);

		//[166, 241, 217, 42, 130, 200, 216, 254, 67, 0, 0, 48, 57, 0, 0, 0, 2, 85, 228, 54, 211, 0, 0, 0, 11, 0, 93, 165, 255, 75, 86, 236, 148]
// [0, 93, 165, 255]


        // console.log(d);
// [12345, 2, 1441013873, 11, 6137343, 1263987860] 583467416254095926783
// 3.2.18.285 583467416254095900000 6094848

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

module.exports = qq;