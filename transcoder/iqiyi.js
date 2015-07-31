var path = require("path"); 
var exec = require('child_process').exec;

var iqiyi = {
	transcode : function (node){
        var targetFile = path.resolve(node.path, '.', node.idx + ".ts");
        var cmd = [];
        cmd.push("ffmpeg -i " + node.file + " -vcodec copy -acodec copy -vbsf h264_mp4toannexb " + targetFile);
        cmd.push("rm " + node.file);

        return new Promise(function (resolve, reject){
        	    exec(cmd.join(";"), function (err, stdout, stderr){
				if (err){
					reject(err);
				}
				else{
					resolve({
						path : node.path,							
						i : node.idx,
						file : targetFile
					});
				}
        	    });
        });
	},

	mergeAndTranscode : function (nodes, finalFile){
		var rets = [] , myPath;
		nodes.forEach(function (el){
			rets.push(el.file);			
		});

		myPath = nodes[0]["path"];

	    var targetFile = path.resolve(myPath, '.', "output.mp4");

      	var cmd = [];

         cmd.push('ffmpeg -i "concat:' + rets.join("|") + '" -acodec copy -vcodec copy -absf aac_adtstoasc ' + targetFile);
         cmd.push('ffmpeg -y -i ' + targetFile + " '" + finalFile + "'");

         console.log(cmd);
		return new Promise(function (resolve, reject){
		    exec(cmd.join(";"), function (err, stdout, stderr){
				if (err){
					reject(err);
				}
				else{
					resolve({
						finalFile : finalFile,
						workPath : myPath
					});
				}
		    });
		});
	}
};

module.exports = iqiyi;