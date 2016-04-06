(function() {
  "use strict";

var fs = require('fs');
var utils = require('./utils.js');

function checksum (input) {
    var hash = require('crypto').createHash('sha256').update(input, 'utf8');
    var hashBase64 = hash.digest('base64');
    return 'sha256-' + hashBase64;
}

module.exports = function(options) {

  var path = require('path');
  var sourceFolder = path.resolve(__dirname + '/../') + "/" + options.dev;
  var distFolder   = path.resolve(__dirname + '/../') + "/" + options.dist;
  var assets = JSON.parse(fs.readFileSync(sourceFolder + '/assets.json'));

  var error = false;
  var throwError = function(err) {
    if (!error) {
      console.log('====================Assets build error (task:templates)==================='.bold.magenta);
      error = true;
    }
    console.log(err)
  }, finish = function() {
    if (error)
      console.log('====================************************************==================='.bold.magenta);
  }

  for (var i in assets) {
    var target = i.split(',');

    for (var k=0; k<target.length; k++) {
      var path = target[k].trim(" ");

      try {

        var context = fs.readFileSync('./src/'+target[k].trim(" ")).toString();

        function scripts(assets, callback) {
          //assets is an array of Asset object. see json schema for reference
          var s = '';
          for (var r = 0; r < assets.length; r++) {
            try {
              var assetContent = fs.readFileSync(sourceFolder + "/" + assets[r].path.trim(" ")).toString();
              var sh = checksum(assetContent);

              if (sh !== assets[r].signature) {
                console.log('Signature changed '.green + "for file at path: '"+ assets[r].path.trim(" ").toString().yellow+"'. New signature is: " + sh)
                assets[r].signature = sh;
              } 
              var newPath = (assets[r].vendor ? 'vendor/': '') + assets[r].name + (assets[r].version ? "-"+assets[r].version : "") + '.js';

              if (r !== 0) s += '\t';
              s += '\t<script type="text/javascript" src="js/'+newPath+'" integrity="'+sh+'" crossorigin="anonymous"></script>'
              if (r !== assets.length -1) s+= '\n';


              fs.writeFileSync(distFolder + "/js/" + newPath, assetContent.toString());

            } catch (e) {
              throwError('Error processing file: "'.underline.red + String(sourceFolder + '/' +assets[r].path.trim(" ").toString()).yellow + '". Error is: '.red + e.toString().black);
            }
          }
          return s;
        }

        function stylesheets(assets) {
          var s = '';
          for (var r = 0; r < assets.length; r++) {
            try {
              var assetContent = fs.readFileSync(sourceFolder + "/" + assets[r].path.trim(" ")).toString();

              var newPath = (assets[r].vendor ? 'vendor/': '') + assets[r].name + '.css';

              s += '\t<link rel="stylesheet" href="css/'+newPath+'" />\n';


              fs.writeFileSync(distFolder + "/css/" + newPath, assetContent.toString());
            }
            catch (e) {
              throwError('Error processing file:'.underline.red  + String(sourceFolder + '/' +assets[r].path.trim(" ").toString()).yellow + '". Error is: '.red + e.toString().black);
            }
          }
          return s;
        }

        context = context.replace("</head>", stylesheets(assets[i].css) + "\n</head>");

        if (utils.type(assets[i].js) == 'object') {
          context = context.replace("</head>", scripts(assets[i].js.pre) + "\n</head>");
          context = context.replace("</body>", scripts(assets[i].js.post) + "\n\t</body>");
        } else {
          context = context.replace("</body>", scripts(assets[i].js) + "\n</body>");
        }

        fs.writeFileSync(distFolder + "/" + path, context);

      } catch(e) {
        throwError('Error processing file:'.underline.red + ' "' +target[k].trim(" ").toString().yellow + '". Error is: '.red + e.toString().black)
      }
    }
  }

  fs.writeFileSync('./src/assets.json', JSON.stringify(assets, null, 2));

  finish();

}

})()

