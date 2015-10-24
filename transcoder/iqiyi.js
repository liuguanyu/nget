var path = require("path");
var fs   = require("fs");
var exec = require('child_process').exec;

module.exports = {
	transcode : function (node){
        var targetFile = path.resolve(node.path, '.', node.idx + ".ts");
        var cmd = "ffmpeg -i " + node.file + " -vcodec copy -acodec copy -vbsf h264_mp4toannexb " + targetFile + " -loglevel -8";

        return new Promise(function (resolve, reject){
    	    exec(cmd, function (err, stdout, stderr){
    			if (err){
    				reject(err);
    			}
    			else{
                    fs.unlink(node.file, function(){
    					resolve({
    						path : node.path,
    						i : node.idx,
    						file : targetFile
    					});
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

	    // var targetFile = path.resolve(myPath, '.', "output.mp4");

      	var cmd = 'ffmpeg -i concat:\"' + rets.join("|") + '\" -acodec copy -vcodec copy -absf aac_adtstoasc \"' + finalFile + '\" -loglevel  -8';

		return new Promise(function (resolve, reject){
		    exec(cmd, function (err, stdout, stderr){
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
		});/*.then(function (){
            return new Promise(function (resolve, reject){
                var cmd = "ffmpeg -y -i " + targetFile + " \"" + finalFile + "\" -loglevel  -8";

                exec(cmd, function (err, stdout, stderr){
                    if (err){
                        reject(err);
                    }

                    resolve({
                        finalFile : finalFile,
                        workPath : myPath
                    });
                });
            });
        });*/
	}
};