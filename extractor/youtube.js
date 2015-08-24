/**
 * Created by jiangli on 15/1/6.
 */

"use strict";
var request = require('request');
var crypto = require('crypto');
var urlparts = require('urlparts');
var qs = require('qs');
var request = require('request');

/**
 * [_parseIqiyi 解析爱奇艺视频]
 * @param  [type] $url [description]
 * @return [type]      [description]
 */
var getVidFromUrl = function (url){
    var matches = url.match(/youtu\.be\/([^/]+)/)
         || url.match(/youtube\.com\/embed\/([^/?]+)/)
         || url.match(/youtube\.com\/v\/([^\/?]+)/) ;

    if (matches) return matches[1];
    
    var urlInfo = urlparts(url);
    var qsList = qs.parse(urlInfo["query"]);


    if (qsList["v"]){
        return qsList["v"];
    }
};

module.exports = function($url,callback){
    var vid = getVidFromUrl($url);

    var options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19'
        }
    };

    var options1 = JSON.parse(JSON.stringify(options));

    options1["url"] = "http://www.youtube.com/get_video_info?video_id=" + vid;

    request(options1 , function(er, response, body) {
        if (er){
            throw er;
        }

        var info = qs.parse(body);
        var title = info["title"];

        var streams = qs.parse(info["url_encoded_fmt_stream_map"]);

        var urls = streams["url"];

        var ret = {"title" : title , "urls" : (Array.isArray(urls) ? [urls[0]] : [urls])};

        return callback(null, ret)

        // if (Array.isArray(urls)){
        //     return callback(null, urls);
        // }
        // else{
        //     return callback(null, [urls]);
        // }
        
    });
}
