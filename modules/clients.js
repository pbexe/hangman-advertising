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
	console.log('a user connected');
});

// Create HTTP Server
http.listen(3000, function(){
	console.log('listening on *:3000');
});

process.on("message", function(frame) {
    io.emit("frame", JSON.parse(frame));
});
