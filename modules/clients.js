var express = require("express");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var QRCodeGenerator = require('qrcode');
var QRCodeReaderModule = require('qrcode-reader');
var QRCodeReader = new QRCodeReaderModule();
var Jimp = require("jimp");

var socketClients = [];
var rendering = true;

app.use(express.static("static"));

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

app.post("/upload", upload.single("codes"), function(req, res, next){
	console.log(req.file.path);
	Jimp.read(req.file.path, function(error, lenna){
		lenna.contrast(1)
			.write("uploads/adjusted.jpg");
	})
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

function checkConfigured(){
	for (var i = 0; i < socketClients.length; i++){
		if (socketClients[i].checked === false){
			return false;
		}
	}
	return true;
}

function renderMode(){
	io.emit("render");
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
		if (checkConfigured()) renderMode();
	});

	socket.on("get code", function(packet, callback){
		console.log("Generating code for " + socket.id + " (" + getSocketIndex(socket.id) + ")");
		QRCodeGenerator.draw(getSocketIndex(socket.id).toString(), function(err, canvas){
	            var buffer = canvas.toBuffer();
	            Jimp.read(buffer, function(err, image) {
	                for (var y = 0; y < image.bitmap.width; y++) {
	                    for (var x = 0; x < image.bitmap.height; x++) {
	                        console.log(image.getPixelColor(x, y));
	                        if (image.getPixelColor(x, y) == parseInt("FFFFFFFF", 16)) {
	                            image.setPixelColor(parseInt("DF298AFF", 16), x, y);
	                         } else if (image.getPixelColor(x, y) == parseInt("000000FF", 16)) {
	                            image.setPixelColor(parseInt("FFFFFFFF", 16), x, y);
	                        }
	                    }
	                }
	                image.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
	                    console.log(err);
	                    console.log(buffer.toString("base64"));
	                    callback("data:image/png;base64," + buffer.toString("base64"));
	                });
			});
	       });
	});

	socket.on("disconnect", function(packet){
		socketClients.splice(getSocketIndex(socket.id), 1);
		configure();
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
