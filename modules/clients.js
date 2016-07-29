var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var QRCode = require('qrcode');

var socketClients = [];
var rendering = true;

// Configuring Routes
app.get('/', function(req, res){
	console.log("Sending root");
	res.sendfile('slave.html');
});

app.get('/master', function(req, res){
	console.log("Sending root");
	res.sendfile('master.html');
});

app.get("/configure", function(req, res) {
    rendering = false;
    io.emit("configure");
});

app.get("/render", function(req, res) {
    rendering = true;
    io.emit("render");
});

// Socket.IO
io.on('connection', function(socket){
	if (socketClients.indexOf(socket.id) === -1){
		socketClients.push(socket.id);
	}
	io.emit("configure");
	
	socket.on("get code", function(packet, callback){
		console.log("Generating code for " + socket.id + " (" + socketClients.indexOf(socket.id) + ")");
		QRCode.toDataURL(socketClients.indexOf(socket.id).toString(), function(err, url){
			callback(url);
		});
	});
});

// Create HTTP Server
http.listen(3000, function(){
	console.log('listening on *:3000');
});

process.on("message", function(message) {
    if (rendering == true) {
        io.emit("frame", JSON.parse(message));
    }
});
