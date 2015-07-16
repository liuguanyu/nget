var uuid = require("uuid");

var util = require("../util/util.js");

var iqiyi = function (){};

iqiyi.prototype = {
	extract : function (url){
		var genUid = uuid.v4().replace(/-/g, "");

		util.httpUtil.getHtml(url).then(function (data){
			console.info(data);
		});
	}
}

module.exports = iqiyi;