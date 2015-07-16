var headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19'
};

var request = require('request');

var util = {};

var httpUtil = {
	getHtml : function (url){
		var opt = {
			'headers' : headers,
			'url' : url
		}

		return new Promise(function (resolve, reject){
			request(opt, function (err, response, body){
				if (err){
					reject(err);
				}	

				resolve(body);
			});
		});
	}
}

util.httpUtil = httpUtil;

module.exports = util;