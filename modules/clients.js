var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var QRCodeGenerator = require('qrcode');
var QRCodeReaderModule = require('qrcode-reader');
var QRCodeReader = new QRCodeReaderModule();

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

app.post("/upload", function(req, res){
	console.log(req.files);
	configure();
});

function getSocketIndex(id){
	for (var i = 0; i < socketClients.length; i++){
		if (socketClients[i].id == id) return i;
	}
	return false;
}

function configure(){
	for (var i = 0; i < socketClients.length; i++){
		socketClients[i].checked = false;
	}
	io.emit("configure");
}

// Socket.IO
io.on('connection', function(socket){
	if (getSocketIndex(socket.id) === false){
		socketClients.push({id: socket.id, checked: false, width: 0, height: 0});
	}

	configure();
	
	socket.on("constraints", function(packet){
		var index = getSocketIndex(socket.id);
		if (index !== false){
			socketClients[index].checked = true;
			socketClients[index].width = packet.width;
			socketClients[index].height = packet.height;
		}
		console.log("Validated " + socket.id);
		console.log(socketClients);
	});

	socket.on("get code", function(packet, callback){
		console.log("Generating code for " + socket.id + " (" + getSocketIndex(socket.id) + ")");
		QRCodeGenerator.toDataURL(getSocketIndex(socket.id).toString(), function(err, url){
			callback(url);
		});
	});

	socket.on("disconnect", function(packet){
		socketClients.splice(getSocketIndex(socket.id), 1);
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
