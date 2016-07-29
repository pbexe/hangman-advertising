var fs = require("fs");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var child_process = require('child_process');

// Configuring Routes
app.get('/', function(req, res){
	console.log("Sending root");
	res.sendfile('index.html');
});

// Delta Time
var dt = 0;

// Render Loop
setInterval(function() {
    console.log("start");
    var slave = child_process.fork('modules/render.js');

    slave.send(dt);
    dt++;

    slave.on("message", function(frame) {
        io.emit("frame", { frame: frame.frame, dt: frame.dt });
        slave.kill("SIGINT");
    });
}, 42);

// Socket.IO
io.on('connection', function(socket){
	console.log('a user connected');
});

// Create HTTP Server
http.listen(3000, function(){
	console.log('listening on *:3000');
});
