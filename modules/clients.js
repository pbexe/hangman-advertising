var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var QRCodeGenerator = require('qrcode');
var QRCodeReaderModule = require('qrcode-reader');
var QRCodeReader = new QRCodeReaderModule();

var socketClients = [];

var uploading = multer({
	dest: __dirname + '../public/uploads/',
})

// Configuring Routes
app.get('/', function(req, res){
	console.log("Sending root");
	res.sendfile('slave.html');
});

app.post("/upload", function(req, res){
	console.log(req.files);
});

// Socket.IO
io.on('connection', function(socket){
	if (socketClients.indexOf(socket.id) === -1){
		socketClients.push(socket.id);
	}
	io.emit("configure");
	
	socket.on("get code", function(packet, callback){
		console.log("Generating code for " + socket.id + " (" + socketClients.indexOf(socket.id) + ")");
		QRCodeGenerator.toDataURL(socketClients.indexOf(socket.id).toString(), function(err, url){
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

	socket.on("disconnect", function(packet){
		socketClients.splice(socketClients.indexOf(socket.id), 1);
	});
});

// Create HTTP Server
http.listen(3000, function(){
	console.log('listening on *:3000');
});

process.on("message", function(message) {
    io.emit("frame", JSON.parse(message));
});
