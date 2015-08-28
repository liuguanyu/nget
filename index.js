#!/usr/bin/env node 
var cli = require("commander"),
	fs = require("fs"),
	path = require("path");

cli.
	allowUnknownOption().
	version( require("./package.json").version ).
	option("-f, --file [value]", "download urls' file").
	option("-u, --url [value]", "download url").
	option("-d, --download [value]", "download folder").
	option("-t, --thread [value]", "download thread number").
	parse( process.argv );

// 载入配置
var config = require("./config.json");
if(cli.thread && typeof(cli.thread)=="string") config.thread = parseInt(cli.thread);
if(cli.download && typeof(cli.download)=="string") config.download = cli.download;
fs.writeFile(
	path.resolve(__dirname,"config.json"), 
	JSON.stringify(config, null, "\t")
);

var dispatch = require("./pline/dispatch.js")(config);
//检测是否是管道
if(!process.stdin.isTTY) return dispatch.pipe();

//非管道检测有下载列表，有下载URL，无下载列表和下载URL三种情况，优先级下载列表大于URL
if(cli.file && typeof(cli.file)=="string") return dispatch.file(cli.file);
else if(cli.url && typeof(cli.url)=="string") return dispatch.url(cli.url);
else return dispatch.file("./download.txt");