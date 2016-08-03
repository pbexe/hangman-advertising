var fs = require("fs");

var Canvas = require("canvas");

function randInt(min, max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

fs.readFile("../Icon.png", function(err, data){
	if (err) console.log(err);

	var img = new Canvas.Image;
	img.src = data;

	var i = 1;
	setInterval(function(){
		console.log("Render " + i);
		var width = 800;
		var height = 800;
		var canvas = new Canvas(width, height, "jpg");

		// y = 1/x
		// i = x

		var imageContext = canvas.getContext('2d');
		// imageContext.drawImage(img, width - 2 ^ (i - 2), height - 2 ^ (i - 2), img.width/4, img.height/4);
		imageContext.drawImage(img, width - i * 2, height - i * 2, img.width/4, img.height/4);

		var darkCircle = canvas.getContext('2d');
		darkCircle.fillStyle = 'rgba(85, 62, 152, 0.75)';
		darkCircle.beginPath();
		darkCircle.arc(-200 + (i * 2), -200 + (i * 2), 200, 0, Math.PI * 2, false);
		darkCircle.fill();

		for (var i = 0; i < 10; i++) {
			var dot = canvas.getContext('2d');
			darkCircle.fillStyle = 'rgba(85, 62, 152, 0.75)';
			darkCircle.beginPath();
			darkCircle.arc(randInt(0, width), randInt(0, height), randInt(0, i * i), 0, Math.PI * 2, false);
			darkCircle.fill();
		}

		var data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');

		fs.writeFile("output.png", buf);
		i++;
	}, 1);
});
