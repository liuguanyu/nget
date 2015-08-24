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
        return util.httpUtil.getHtml("http://www.youtube.com/get_video_info?video_id=" + getVidFromUrl(url)).then(function (data){
            var info = qs.parse(data),
                title = info["title"],
                streams = qs.parse(info["url_encoded_fmt_stream_map"]),
                urls = streams["url"];

            console.info(info);

            return {
                "title" : title,
                "urls"  : (Array.isArray(urls) ? [urls[0]] : [urls]),
                "size"  : 1,
                "postfix" : postfix
            };

            var ret = {"title" : title , "urls" : (Array.isArray(urls) ? [urls[0]] : [urls])};
        })
    }
};

module.exports = youtube;