var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:13.0) Gecko/20100101 Firefox/13.0'
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