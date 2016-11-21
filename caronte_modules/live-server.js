var app 		= require('express')();
var fs      = require('fs');
var path = require('path');
var sockets = [];


module.exports = function(option) {

	var io = require('socket.io')(option.socketPort || 3031);
	io.on('connection', function (socket) {
    sockets.push(socket);
  });

	app.get('/__live.js', function(req, res) {
    res.sendFile(path.resolve(__dirname + './../node_modules/socket.io-client/socket.io.js'));
  });

  app.get('/___live.js', function(req, res) {
    res.sendFile(path.resolve(__dirname + '/live-client.js'));
  });


  app.get('*', function (req, res) {
    if (req.originalUrl.split("/")[req.originalUrl.split("/").length - 1] == '') req.originalUrl += 'index.html';

    if (req.originalUrl.indexOf('.') == -1)
      req.originalUrl += '.html';

    if (req.originalUrl.indexOf('.html') !== -1) {
      res.write(fs.readFileSync(__dirname + '/../dist' + req.originalUrl).toString().replace("</body>", '<script src="/__live.js"></script><script src="/___live.js"></script>\n</body>'));
      res.end();
    } else {
      res.sendFile(path.resolve(__dirname + '/../dist' + req.originalUrl));
    }
	});

  app.listen(option.serverPort || 3000);


	return {
		triggerRefresh: function() {
	  	for (var i = 0; i < sockets.length; i++)
	    	sockets[i].emit('refresh', { refresh: 'true' });
		}
	};

}
