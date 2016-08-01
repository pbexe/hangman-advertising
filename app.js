var fs = require("fs");
var child_process = require('child_process');

var fps = 30;

var max_constraints = {width: 0, height: 0}; //Any hint of what a contraint might be in this instance?

// Clients //I'm glad someone tried to do some useful commenting, emphasis on tried...
var communicator = child_process.fork("modules/clients.js"); //Create process to run webserver
communicator.on("message", function(message) {
	message = JSON.parse(message);
	if (message.type = "constraints") {
		if (max_constraints.width < message.contents.width) max_constraints.width = message.contents.width;
		if (max_constraints.height < message.contents.height) max_constraints.height = message.contents.height; //This nested nested one line if statement was why python was invented...
		console.log("New constraints are " + max_constraints.width + "x" + max_constraints.height);
		renderer.send(JSON.stringify({
			type: "constraints",
			contents: {
				width: max_constraints.width,
				height: max_constraints.height
			}
		}));
	}
});

// Delta Time
var dt = 0;

// Render Loop
setInterval(function() {
    var renderer = child_process.fork("modules/render.js"); // Create Child process to render canvas on request

    renderer.send(dt);

    dt++;

    renderer.on("message", function(frame) {
        communicator.send(JSON.stringify({ frame: frame.frame,
        		dt: frame.dt, time: Date.now() }));
        renderer.kill("SIGINT"); //Killing is bad, but killing processes is all in a days work, at least its not SIGKILL, because that would always be fatal - http://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html
    });
}, 1000/fps);

var cv = require("opencv"); //I dont want to publish my CV to the interwebs... OK OK, I worked as a psychologist for a while, I'm ashamed of myself too...

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 2000;

var BLUE  = [0, 255, 0]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var slight_grey_ish_color_just_off_green_but_not_quite_blue = [253,254,253] // B, G, R (Big Green Rhombus)...

cv.readImage('uploads/testimage2.jpg', function(err, im) {
    if (err) throw err; 

    width = im.width()
    height = im.height()
    if (width < 1 || height < 1) throw new Error('Image has no size'); //Lets not be heightist...

    var out = new cv.Matrix(height, width);

    var lowerBound = [80, 30, 186];
    //var color = 188, 119, 252
    //var other color = 220, 116, 250
    var upperBound = [255, 150, 255];
    im.inRange(lowerBound, upperBound);

    im.save("uploads/test.jpg");

    im_canny = im.copy(); //im_funny 
    im_canny.canny(lowThresh, highThresh);
    im_canny.dilate(nIters);

    contours = im_canny.findContours();

    var possibleScreens = [];
    var impossibleScreens = [];

    console.log(contours.size());

    // Loop for Each Contour
    for (i = 0; i < contours.size(); i++) {

        if (contours.area(i) < minArea) continue;

        var arcLength = contours.arcLength(i, true);
        contours.approxPolyDP(i, 0.01 * arcLength, true);

        // Test if Contour has more than 4 Vertices           // WOW A WILD COMMENT APPEARED, THEY ARE RARE IN THESE PARTS
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

                        // Test if Contour is Inside Another Contour //I hate when that happens, damn contours
                        if ((cbr.i.x < cbr.s.x) &&
                           (cbr.i.y < cbr.s.y) &&
                            ((cbr.i.x + cbr.i.width) > (cbr.s.x + cbr.s.width)) &&
                           ((cbr.i.y + cbr.i.height) > (cbr.s.y + cbr.s.height))) {
                            // Contours that Lie Inside Another Contour
                            //out.drawContour(contours, s, GREEN);
                            if (possibleScreens.indexOf(s) > -1) { //HOLY CRAP! A wild nested nested nested nested nested nested if statement appeared, it challenged you to scrabble
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

    // Log all the Vertices of the Screens 
    for (ps in possibleScreens) {
        out.drawContour(contours, possibleScreens[ps], RED);
        console.log(contours.cornerCount(possibleScreens[ps]));
        for (point = 0; point < contours.cornerCount(possibleScreens[ps]); point++) { 
            console.log(contours.point(possibleScreens[ps], point));
        }
    }

    out.save('uploads/detect-shapes.png');
    console.log('Image saved to ./tmp/detect-shapes.png');
});

var QrCode = require('qrcode-reader');
var qr = new QrCode();
qr.callback = function(result,err) { if(result) console.log("Result: " + result); }
qr.decode("uploads/qrcode.png");
