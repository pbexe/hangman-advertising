var Canvas = require('canvas');
var fs = require("fs");
var Image = Canvas.Image;

var width = 800;
var height = 600;
var canvas = new Canvas(width, height, "jpg");

var maxRadius = 50;
var minRadius = 0;

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

var dots = [];
for (var i = 0; i < 100; i++) {
	var dot = canvas.getContext('2d');
	dot.fillStyle = 'rgba(85, 62, 152, 0.75)';
	dot.beginPath();
	dot.savedX = randInt(0, width);
	dot.savedY = randInt(0, height);
	// console.log(dot.savedX, dot.savedY);
	dot.savedRadius = randInt(minRadius, 10);
	dot.direction = randInt(0, 360);
	dot.radiusTarget = randInt(dot.savedRadius, maxRadius);
	dot.targetDirection = (dot.savedRadius < dot.radiusTarget) ? "up" : "down";
	dot.arc(dot.savedX, dot.savedY, dot.savedRadius, 0, Math.PI * 2, false);
	dot.fill();
	dots.push(dot);
}

var darkCircle = canvas.getContext('2d');
darkCircle.fillStyle = 'rgba(85, 62, 152, 0.75)';
var imageContext = canvas.getContext('2d');

// fs.readFile(__dirname + "/../Icon.png", function(err, data){
	// if (err) console.log(err);
	process.on("message", function(dt) {

		console.log("Generating frame " + dt);

		// var img = new Canvas.Image;
		// img.src = data;

		for (var dot = 0; dot < dots.length; dot++) {
			dots[dot].clearRect(
				dots[dot].savedX,
				dots[dot].savedY,
				dots[dot].savedX + dots[dot].width,
				dots[dot].savedY + dots[dot].height
			);
			dots[dot].beginPath();
			dots[dot].savedX += getXFromAngle(dots[dot].direction);
			dots[dot].savedY += getYFromAngle(dots[dot].direction);
			// dots[dot].moveTo(dots[dot].savedX, dots[dot].savedY);

			if (dots[dot].targetDirection == "up"){
				if (dots[dot].savedRadius >= dots[dot].radiusTarget){ // above target
					dots[dot].radiusTarget = randInt(minRadius, dots[dot].radiusTarget);
					dots[dot].targetDirection = "down";
				} else {
					dots[dot].savedRadius++;
				}
			} else {
				if (dots[dot].savedRadius <= dots[dot].radiusTarget){ // below target
					dots[dot].radiusTarget = randInt(dots[dot].radiusTarget, maxRadius);
					dots[dot].targetDirection = "up";
				} else {
					dots[dot].savedRadius--;
				}
			}
			dots[dot].arc(dots[dot].savedX, dots[dot].savedY, dots[dot].savedRadius, 0, Math.PI * 2, false);
			dots[dot].fill();

			var x = dots[dot].savedX;
			var y = dots[dot].savedY;

			if (x - dots[dot].savedRadius > width){		// too far to the right
				dots[dot].direction = randInt(180, 360);
			}
			if (x + dots[dot].savedRadius < 0){			// too far to the left
				dots[dot].direction = randInt(0, 180);
			}
			if (y - dots[dot].savedRadius > height) {		// too far to the bottom
				dots[dot].direction = randInt(90, 270);
			}
			if (y + dots[dot].savedRadius < 0) {			// too far to the top
				dots[dot].direction = randInt(90, 270);
			}
		}

		// var data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
		// var buf = new Buffer(data, 'base64');

		process.send(JSON.stringify({
			frame: canvas.toBuffer(),
			dt: dt
		}));
	});
// });