var postfix = "mp4";
var uuid = require("uuid");
var md5 = require("md5");
var bigInt = require("big-integer");

var util = require("../util/util.js");
var letv = function (){};

var getHtmlByUrl = (function (){
	var html;

	return function (url){
		return new Promise(function (resolve, reject){
			if (html){
				resolve(html);
			}

			return util.httpUtil.getHtml(url).then(function (data){
				resolve(data);
			});
		});			
	};
})();

var getVid = function (url){
	var reg1 = /http:\/\/www.letv.com\/ptv\/vplay\/(\d+).html/,
	    reg2 = /http:\/\/www.letv.com\/ptv\/vplay\/(\d+).html/;   

	return new Promise(function (resolve, reject){
		if (url.match(reg1)){
			resolve(url.match(reg1)[1]);
		}

		if (url.match(reg2)){
			resolve(url.match(reg1)[2]);
		}

		return getHtmlByUrl(url).then(function(data){
			resolve(data.match(/vid="(\d+)"/)[1]);
		});
	});	    
}

var getTitle = function (url){
	return getHtmlByUrl(url).then(function (data){
		return data.match(/name="irTitle" content="(.*?)"/)[1];
	})
};

var calcTimeKey = function (t){
	var ror = function (val, r_bits){
		var opt1 = bigInt(val).and(
			bigInt(2).pow(32).minus(1)
		).shiftRight(
			bigInt(r_bits).divmod(32)["remainder"]
		);

		var opt2 = bigInt(val).shiftLeft(
			bigInt(32).minus(
				bigInt(r_bits.divmod(32)["remainder"])
			)
		).and(
			bigInt(2).pow(32).minus(1)
		);

		return opt1.or(opt2);
	};

    return ror(
    	ror(bigInt(t), bigInt(773625421).divmod(13)["remainder"]).xor(bigInt(773625421)), 
    	bigInt(773625421).divmod(17)["remainder"]
    ).toJSNumber();
};

var decode = function (data){
    var version = data.slice(0, 5).toString().toLowerCase();
    
    if (version == "vc_01"){
    	var loc2 = data.slice(5);

    	var length = loc2.length;
    	var loc4 = Array(2*length).fill(0);

    	Array(length).fill(0).forEach(function (el, i){
    		loc4[2 * i] = bigInt(loc2[i]).shiftRight(4);
    		loc4[2 * i + 1]  = bigInt(loc2[i]).and(15);
    	});

		loc4 = loc4.map(function (el){
			return (el.toJSNumber) ? el.toJSNumber() : el;
		});

        var loc6 = loc4.slice(loc4.length - 11).concat(loc4.slice(0, loc4.length - 11));

        var loc7 = Array(length).fill(0);

        loc7 = loc7.map(function (el, i){
        	return (bigInt(loc6[2 * i]).shiftLeft(4)).add(bigInt(loc6[2 * i + 1]));
        });

        var loc = loc7.map(function (el){
        	el = (el.toJSNumber) ? el.toJSNumber() : el;
			return String.fromCharCode(el);
        });

        return loc.join('');
    }
    else {
    	return data;
    }
};

var getM3u8List = function (url){
	return util.httpUtil.getHtml(url).then(function (data){
		var info = JSON.parse(data);

	    return util.httpUtil.getHtml(info["location"], undefined, false).then(function (m3u8){
	    	var m3u8List = decode(m3u8).match(/http.*/g);

	    	return m3u8List;
	    });
	});
};

var _videoInfo = function (vid){
	var url = ['http://api.letv.com/mms/out/video/playJson?id=',
	    vid, '&platid=1&splatid=101&format=1&tkey=', 
	    calcTimeKey(Math.floor(+new Date()/1e3)), '&domain=www.letv.com'].join('');

	return util.httpUtil.getHtml(url).then(function (data){
		var info = JSON.parse(data);
		var supportsStreams = info["playurl"]["dispatch"];
		var supportsStreamsKeys = Object.keys(supportsStreams);

		var selectStreamKey = supportsStreamsKeys.reduce(function (prev, current){
			var testP = /p/;

			if (testP.test(prev) && !testP.test(current)){
				return prev;
			}

			if (!testP.test(prev) && testP.test(current)){
				return current;
		    }

		    if (testP.test(prev) && testP.test(current)){
		    	var newPrev = parseInt(prev.replace(/p/g, ""), 10);
		    	var newCurrent = parseInt(current.replace(/p/g, ""), 10);

		    	return newPrev >= newCurrent ? prev : current;
		    } 

		    return parseInt(prev, 10) >= parseInt(current, 10) ? prev : current;
		}, 0);

		var url = info["playurl"]["domain"][0] + info["playurl"]["dispatch"][selectStreamKey][0];
    	var ext = info["playurl"]["dispatch"][selectStreamKey][1].split('.')[-1];
    	url += ["&ctv=pc&m3v=1&termid=1&format=1&hwtype=un&ostype=Linux&tag=letv&sign=letv&expect=3&tn=",
    		Math.random(), "&pay=0&iscpn=f9051&rateid=", selectStreamKey].join('');

    	return getM3u8List(url);
	});
};

var getVideoInfo = function (vid){
	return _videoInfo(vid);
};

letv.prototype = {
	extract : function (url){
		return getVid(url).then(function (vid){
			return getTitle(url).then(function (title){
				return getVideoInfo(vid).then(function (data){
					return {
						size : 'N/A',
						urls : data,
						title : title,
						site_postfix : postfix
					};

				})
			});
		}, function (err){
			console.info(err);
		});
	}
};

module.exports = letv;
