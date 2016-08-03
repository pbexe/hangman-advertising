var Canvas = require('canvas');
var Image = Canvas.Image;

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

process.on("message", function(dt) {
	var canvas = new Canvas(2800, 2800, "jpg");

	var bg = canvas.getContext("2d");
	bg.rect(0,0, canvas.width, canvas.height);
	var bg_gradient = bg.createRadialGradient(238, 50, 10, 238, 50, 300);
	bg_gradient.addColorStop(0, '#8ED6FF');
	// bg_gradient.addColorStop(1, '#004CB3');
	//console.log(toColour(dt));
	bg_gradient.addColorStop(1, toColour(255));
	bg.fillStyle = bg_gradient;
	bg.fill();

	var context = canvas.getContext('2d');

	context.font = '128px Impact';
	context.fillStyle = "black";
	context.rotate(0.1);
	context.fillText("Frame " + dt + "!", 50, 100);

	var te = context.measureText("Frame " + dt + "!");
	context.strokeStyle = 'rgba(0,0,0,0.5)';
	context.beginPath();
	context.lineTo(50, 102);
	context.lineTo(50 + te.width, 102);
	context.stroke();

	//require("fs").writeFile("out.svg", canvas.toBuffer());
	//console.log("data:image/svg+xml;utf8," + canvas.toBuffer().toString().replace(/[\r\n]/g, "").replace('<?xml version="1.0" encoding="UTF-8"?>', ""));

	/*process.send({
			frame: "data:image/svg+xml;utf8," + canvas.toBuffer().toString().replace(/[\r\n]/g, "").replace('<?xml version="1.0" encoding="UTF-8"?>', ""), dt: dt
	});*/

	//console.log(canvas.toDataURL());

	process.send(JSON.stringify({
		frame: canvas.toBuffer(),
		dt: dt
	}));
});
