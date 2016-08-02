var express = require("express");
var multer = require("multer");
var upload = multer({
    dest: "uploads/"
});
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var QRCodeGenerator = require('qrcode');
var QRCodeReaderModule = require('qrcode-reader');
var Jimp = require("jimp");

var socketClients = [];
var rendering = true;

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 2000;
var BLUE = [0, 255, 0]; // B, G, R
var RED = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var slight_grey_ish_color_just_off_green_but_not_quite_blue = [253, 254, 253] // B, G, R (Big Green Rhombus)...

var cv = require("opencv"); //I dont want to publish my CV to the interwebs... OK OK, I worked as a psychologist for a while, I'm ashamed of myself too...
var Canvas = require("canvas");
global.Image = Canvas.Image;

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 2000;

var BLUE  = [0, 255, 0]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var slight_grey_ish_color_just_off_green_but_not_quite_blue = [253,254,253] // B, G, R (Big Green Rhombus)...

app.use(express.static("static"));

// Configuring Routes
app.get('/', function(req, res) {
    res.sendfile('slave.html');
});

app.get('/master', function(req, res) {
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

app.post("/upload", upload.single("codes"), function(req, res, next) {
	cv.readImage(req.file.path, function(err, im) {
		width = im.width()
		height = im.height()
		if (width < 1 || height < 1) throw new Error('Image has no size');

		var out = new cv.Matrix(height, width);

		var lowerBound = [80, 30, 186];
		var upperBound = [255, 150, 255];
		im.inRange(lowerBound, upperBound);
		im_canny = im.copy();
		im_canny.canny(lowThresh, highThresh);
		im_canny.dilate(nIters);

		contours = im_canny.findContours();

		var possibleScreens = [];
		var impossibleScreens = [];

		// Loop for Each Contour
		for (i = 0; i < contours.size(); i++) {

			if (contours.area(i) < minArea) continue;

			var arcLength = contours.arcLength(i, true);
			contours.approxPolyDP(i, 0.01 * arcLength, true);

			out.drawContour(contours, i, RED);

			// Test if Contour has more than 4 Vertices
			if (contours.cornerCount(i) == 4) {
				// Push as Possible Screen
				possibleScreens.push(i);

				// Loop for Each Contour to Test if any Contours are Inside 
				for (s = 0; s < contours.size(); s++) {
					// Make Sure that the Contour Doesnt Evaluate Position with Itself
					if (s !== i) {
						if (contours.cornerCount(s) == 4) {
							// Declare CBR as Contour Bounding Rect
							var cbr = { i: contours.boundingRect(i), s: contours.boundingRect(s) };

							// Test if Contour is Inside Another Contour
							if ((cbr.i.x < cbr.s.x) &&
								(cbr.i.y < cbr.s.y) &&
								((cbr.i.x + cbr.i.width) > (cbr.s.x + cbr.s.width)) &&
								((cbr.i.y + cbr.i.height) > (cbr.s.y + cbr.s.height))) {
								// Contours that Lie Inside Another Contour
								out.drawContour(contours, s, GREEN);
								if (possibleScreens.indexOf(s) > -1) {
									// Remove these Contours from the Array of Possible Screens
									possibleScreens.splice(possibleScreens.indexOf(s), 1);
								}
							}
						}
					}
				}
			}
		}

		// Left with Array of Definite Screens

		console.log(possibleScreens);
		for (ps in possibleScreens) {
			(function(ps){
				Jimp.read(req.file.path, function(err, jimg) {
					var cbr = contours.boundingRect(possibleScreens[ps])
					jimg.crop(cbr.x, cbr.y, cbr.width, cbr.height);
					jimg.invert();
					jimg.greyscale();
					jimg.contrast(-0.5);

					for (var x = 0; x < jimg.bitmap.width; x++) {
						for (var y = 0; y < jimg.bitmap.height; y++) {
							if (Jimp.intToRGBA(jimg.getPixelColor(x, y)).r > 100) {
								jimg.setPixelColor(parseInt("FFFFFFFF", 16), x, y);
							}
						}
					}

					jimg.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
						//console.log(buffer.toString("base64"));
						//console.log("\n \n \n \n \n \n");

						var qr = new QRCodeReaderModule();

						qr.callback = function(result,err) {
							//console.log(err);
							console.log("Result: " + result + " : " + ps);
							//console.log(possibleScreens[ps]);
							//sendDisplayPoints(ps, contours.point(possibleScreens[ps], 0), contours.point(possibleScreens[ps], 1), contours.point(possibleScreens[ps], 2), contours.point(possibleScreens[ps], 3));
							console.log(socketClients);
							//console.log(result);
							//socketClients[result].vertices = [contours.point(possibleScreens[ps], 0), contours.point(possibleScreens[ps], 1), contours.point(possibleScreens[ps], 2), contours.point(possibleScreens[ps], 3)];
							//process.send({ type: "screensize", content: { vertices: socketClients[result].vertices, id: result } });
						}
						//console.log("data:image/png;base64," + buffer.toString("base64"));
						qr.decode("data:image/png;base64," + buffer.toString("base64"));
					});

					jimg.write("uploads/screen" + ps + ".png", function(err) {

					});
				});
			})(ps);
		}

		out.save('uploads/detect-shapes.png');
		console.log('Image saved to uploads/detect-shapes.png');
	});
	configure();
});

app.get("/emit", function(req, res) {
    io.emit(req.query.command, {
        msg: req.query.msg
    });
    res.json({
        msg: "done",
        params: [req.query.command, req.query.msg]
    });
});

function sendDisplayPoints(id, v1, v2, v3, v4) {
    //io.to(socketClients[parseInt(id)]).emit("position", { vertex1: v1, vertex2: v2, vertex3: v3, vertex4: v4 });
}

function getSocketIndex(id) {
	for (var i = 0; i < socketClients.length; i++) {
		if (socketClients[i].id == id) return i;
	}
	return false;
}

function configure() {
	rendering = false;
	for (var i = 0; i < socketClients.length; i++) {
		socketClients[i].configured = false;
	}
	io.emit("configure");
}

function checkConfigured() {
	for (var i = 0; i < socketClients.length; i++) {
		if (socketClients[i].configured === false) {
			return false;
		}
	}
	return true;
}

function render() {
	io.emit("render");
}

// Socket.IO
io.on('connection', function(socket) {
	console.log("New connection, reconfiguring clients...");
	if (getSocketIndex(socket.id) === false) {
		socketClients.push({
			id: socket.id,
			configured: false,
			width: 0,
			height: 0
		});
	}

	configure();

	socket.on("constraints", function(packet) {
		var index = getSocketIndex(socket.id);
		if (index !== false) {
			socketClients[index].configured = true;
			socketClients[index].width = packet.width;
			socketClients[index].height = packet.height;
		}
		if (checkConfigured()) {
			console.log("Configuration done, switching to render mode");
			// render();
		}
	});

	socket.on("get code", function(packet, callback) {
		QRCodeGenerator.draw(getSocketIndex(socket.id).toString(), function(err, canvas) {
			Jimp.read(canvas.toBuffer(), function(err, image) {
				for (var y = 0; y < image.bitmap.width; y++) {
					for (var x = 0; x < image.bitmap.height; x++) {
						if (image.getPixelColor(x, y) == parseInt("FFFFFFFF", 16)) {
							image.setPixelColor(parseInt("DF298AFF", 16), x, y);
						} else if (image.getPixelColor(x, y) == parseInt("000000FF", 16)) {
							image.setPixelColor(parseInt("FFFFFFFF", 16), x, y);
						}
					}
				}
				image.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
					callback("data:image/png;base64," + buffer.toString("base64"));
				});
			});
		});
	});

	socket.on("disconnect", function(packet) {
		socketClients.splice(getSocketIndex(socket.id), 1);
		configure();
	});
});

// Create HTTP Server
http.listen(3000, function() {
	console.log('listening on *:3000');
});

process.on("message", function(message) {
	if (rendering == true) {
		io.emit("frame", JSON.parse(message));
	}
});
