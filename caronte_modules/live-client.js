var socket = io.connect('http://localhost:3031');

  socket.on('refresh', function (data) {
    if (data.refresh) 
    	window.location.reload();
  });