var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Configuring Routes
app.get('/', function(req, res){
	console.log("Sending root");
	res.sendfile('index.html');
});

// Socket.IO
io.on('connection', function(socket){
	socket.on("handshake", function(packet){
		process.send(JSON.stringify({
			type: "constraints",
			contents: {
				width: packet.width,
				height: packet.height
			}
		}));
	});
});

// Create HTTP Server
http.listen(3000, function(){
	console.log('listening on *:3000');
});

process.on("message", function(message) {
	message = JSON.parse(message);
	if (message.type == "frame"){
		io.emit("frame", message.contents);
	}
});
