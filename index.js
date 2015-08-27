#!/usr/bin/env node 
var cli = require("commander");

cli.
	allowUnknownOption().
	version( require("./package.json").version ).
	option("-f, --file [value]", "download urls' file").
	option("-u, --url [value]", "download url").
	option("-d, --download [value]", "download folder").
	option("-t, --thread [value]", "download thread number").
	parse( process.argv );

//线程数参数设置
var thread = 5;
if(cli.thread && typeof(cli.thread)=="string") thread = parseInt(cli.thread);

//下载地址配置
var folder = "./";
if(cli.download && typeof(cli.download)=="string") folder = cli.download;

var dispatch = require("./pline/dispatch.js")(folder, thread);
//检测是否是管道
if(!process.stdin.isTTY) return dispatch.pipe();

//非管道检测有下载列表，有下载URL，无下载列表和下载URL三种情况，优先级下载列表大于URL
if(cli.file && typeof(cli.file)=="string") return dispatch.file(cli.file);
else if(cli.url && typeof(cli.url)=="string") return dispatch.url(cli.url);
else return dispatch.file("./download.txt");