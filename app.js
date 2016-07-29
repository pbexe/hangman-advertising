var fs = require("fs");
var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	console.log("Sending root");
	res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	fs.readFile("/Users/finnian/Pictures/profile.jpg", function(err, squid){
		if (err) throw err;
		img = new Image;
		img.src = squid;

		for (var i = 0; i < 1000; i++){
			ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
			ctx.font = '30px Impact';
			ctx.rotate(.1);
			ctx.fillText("Awesome! " + i, 50, 100);

			var te = ctx.measureText('Awesome! ' + i);
			ctx.strokeStyle = 'rgba(0,0,0,0.5)';
			ctx.beginPath();
			ctx.lineTo(50, 102);
			ctx.lineTo(50 + te.width, 102);
			ctx.stroke();

			io.sockets.emit("image", canvas.toDataURL());
			console.log("Rendered image");
		}
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});