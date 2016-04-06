var argv        = require('yargs').argv; 
var fs          = require('fs');
var colors      = require('colors');
var crypto      = require('crypto');
var async 			= require('async');
var say         = require('say');
var play 				= require('play');
var express   = require('express');
var config      = require('./labs-config.json');
var utils       = require('./caronte_modules/utils.js');
var pipeToDist = require('./caronte_modules/asset-manager.js');
var sass = require('node-sass');

if (argv.help) {
  console.log(String("\n\tWelcome to Caronte Boilerplate.").bold.green);
  console.log(String("\tThrough this interface you can get advantage of useful scripts for help the development and build process. \n").yellow)
  console.log(String("\t\tOptions: \n"))
  console.log(String("\t\t\t--server \t\t Start development server."));
  console.log(String("\t\t\t--server --silent \t Start development server and prevent to emit sounds."));
  console.log(String("\t\t\t--production \t\t Create distribuition versions."));
  console.log(String("\t\t\t--bundle-assets \t Bundle all assets in a single file."));
  console.log("\n\n");

}

var notify = {
	success: function() {
    if (!argv.hasOwnProperty('silent'))
		  play.sound('./caronte_modules/resources/notify-success.aif');
	}, 
	error: function() {
    if (!argv.hasOwnProperty('silent'))
		  play.sound('./caronte_modules/resources/notify-danger.aif');
	}
}

if (argv['server']) {
  var server = require('./caronte_modules/live-server.js')({socketPort: config.live_development_port, serverPort: config.web_server_port});
  var scssBuild = [];

  if (utils.type(config.scss.build) == 'object')
  	scssBuild.push(config.scss.build);
  else if (utils.type(config.scss.build) == 'array')
  	scssBuild = config.scss.build;

  
  function compilecss() {
  	async.each(scssBuild, function(item, exit) {
  		sass.render({
			  file: config.development_folder + "/" + item.src
			}, function(err, result) {
				if (err) 
					exit(err);
				else {
					fs.writeFileSync(config.development_folder + "/" + item.dist, result.css.toString())
					exit();
				}
			});

  	}, function(error) {
  		if (error) {
  			console.log(String(error).underline.red);
        say.speak(String(error), 'Alex');
        notify.error();
      }
  		else {
  			pipeToDist({dev: config.development_folder, dist: config.distribuition_folder});
    		server.triggerRefresh();
        notify.success();
  		}
  	})  	
  }


  if (utils.type(config.scss.watch) == 'string') {
  	fs.watch(config.development_folder + "/" + config.scss.watch, {recursive: true}, compilecss)
  } else if(utils.type(config.scss.watch) == 'array') {
  	config.scss.watch.forEach(function(href) {
  		fs.watch(config.development_folder + "/" + href, {recursive: true}, compilecss)
  	})

  }

  fs.watch('./src/index.html', {recursive: false}, function() {
    pipeToDist({dev: config.development_folder, dist: config.distribuition_folder});
    server.triggerRefresh();
  })

  
}

