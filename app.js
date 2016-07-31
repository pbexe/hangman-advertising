var fs = require("fs");
var child_process = require('child_process');

var fps = 1;

var max_constraints = {width: 0, height: 0};

// Clients
var communicator = child_process.fork("modules/clients.js");
communicator.on("message", function(message) {
	message = JSON.parse(message);
	if (message.type = "constraints") {
		if (max_constraints.width < message.contents.width) max_constraints.width = message.contents.width;
		if (max_constraints.height < message.contents.height) max_constraints.height = message.contents.height;
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
    var renderer = child_process.fork("modules/render.js");

    renderer.send(dt);

    dt++;

    renderer.on("message", function(frame) {
        communicator.send(JSON.stringify({ frame: frame.frame,
        		dt: frame.dt, time: Date.now() }));
        renderer.kill("SIGINT");
    });
}, 1000/fps);

var cv = require("opencv");

cv.readImage("/Users/finnian/Pictures/profile.jpg", function(err, im){
  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
    for (var i=0;i<faces.length; i++){
      var x = faces[i]
      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
    }
    console.log("saved");
    im.save('./out.jpg');
  });
});