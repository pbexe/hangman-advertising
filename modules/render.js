var started = Date.now();
var Canvas = require('canvas');
var fs = require("fs");
var Image = Canvas.Image;

var width = 3264/4;
var height = 2448/4;
var canvas = new Canvas(width, height, "jpg");

var maxRadius = 50;
var minRadius = 30;

function randInt(min, max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function getXFromAngle(direction) {
	return Math.sin(direction);
}

function getYFromAngle(direction) {
	return Math.cos(direction);
}

function toColour(num) {
	num >>>= 0;
	var b = num & 0xFF,
		g = (num & 0xFF00) >>> 8,
		r = (num & 0xFF0000) >>> 16,
		a = ( (num & 0xFF000000) >> 24 ) / 255;
	b = ("00" + String(parseInt(b, 16))).slice(-2);
	g = ("00" + String(parseInt(g, 16))).slice(-2);
	r = ("00" + String(parseInt(r, 16))).slice(-2);
	return "#" + b + g + r;
}

// fs.readFile(__dirname + "/../Icon.png", function(err, data){
	// if (err) console.log(err);
	process.on("message", function(dt) {
		dt = parseInt(dt);
		// var img = new Canvas.Image;
		// img.src = data;
		// var context = canvas.getContext("2d");
		// context.drawImage(img, 0, 0, img.width / 4, img.height / 4);
		// context.rotate(dt/10);

		var dot = canvas.getContext('2d');
		dot.fillStyle = 'rgba(85, 62, 152, 0.75)';
		dot.beginPath();
		dot.arc(dt + 200, dt + 200, 100, 0, Math.PI * 2, false);
		dot.fill();
		// dots.push(dot);

		canvas.toBuffer(function(err, buf){
			 fs.writeFile("renders/render.png", buf, function(err){
			 	if (err) console.log(err);
			 });
			process.send(JSON.stringify({
				frame: buf,
				dt: dt
			}));
		})
	});
// });