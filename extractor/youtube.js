var postfix = "mp4";
var crypto = require('crypto');
var urlparse = require('url').parse;
var qs = require('qs');

var util = require("../util/util.js");

var getVidFromUrl = function (url){
    var matches = url.match(/youtu\.be\/([^/]+)/)
         || url.match(/youtube\.com\/embed\/([^/?]+)/)
         || url.match(/youtube\.com\/v\/([^\/?]+)/) ;

    if (matches) return matches[1];

    var urlInfo = urlparse(url);
    var qsList = qs.parse(urlInfo["query"]);

    if (qsList["v"]){
        return qsList["v"];
    }
};

var youtube = function (){};

youtube.prototype = {
    extract : function (url){
        var infoUrl = "http://www.youtube.com/get_video_info?video_id=" + getVidFromUrl(url);
        var ua = 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19';

        return util.httpUtil.getHtml(infoUrl, ua).then(function (data){
            var info = qs.parse(data),
                title = info["title"],
                streams = qs.parse(info["url_encoded_fmt_stream_map"]),
                urls = streams["url"];

            return {
                "title" : title,
                "urls"  : (Array.isArray(urls) ? [urls[0]] : [urls]),
                "size"  : "N/A",
                "site_postfix" : postfix
            };
        })
    }
};

module.exports = youtube;