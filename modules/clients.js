var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var QRCode = require('qrcode');

var socketClients = {};

// Configuring Routes
app.get('/', function(req, res){
	console.log("Sending root");
	res.sendfile('slave.html');
});

// Socket.IO
io.on('connection', function(socket){
	io.emit("configure");
	
	socket.on("get code", function(packet, callback){
		QRCode.toDataURL(1, function(err, url){
			callback(url);
		});
	});
	/*socket.on("handshake", function(packet){
		process.send(JSON.stringify({
			type: "constraints",
			contents: {
				width: packet.width,
				height: packet.height
			}
		}));
	});*/
});

// Create HTTP Server
http.listen(3000, function(){
	console.log('listening on *:3000');
});

process.on("message", function(message) {
    io.emit("frame", JSON.parse(message));
});
