var fs = require("fs");
var child_process = require('child_process');
var crop = child_process.fork("modules/crop.js");

var fps = 1;

var max_constraints = {width: 0, height: 0}; //Any hint of what a contraint might be in this instance?

// Clients //I'm glad someone tried to do some useful commenting, emphasis on tried...
var communicator = child_process.fork("modules/clients.js"); //Create process to run webserver
communicator.on("message", function(message) {
	message = JSON.parse(message);
	if (message.type == "constraints") {
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
	} else if (message.type == "screensize") {
        console.log("Message: " + message);
        crop.send(JSON.stringify(message));
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
    	frame = JSON.parse(frame);
    	// console.log(frame)
        crop.send(JSON.stringify({ type: "frame", content: frame.frame, dt: frame.dt }));
        renderer.kill("SIGINT"); //Killing is bad, but killing processes is all in a days work, at least its not SIGKILL, because that would always be fatal - http://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html
    });
}, 1000/fps);

crop.on("message", function(framestring) {
    var frame = JSON.parse(framestring);
    console.log("Transmit Frame");
    communicator.send(JSON.stringify({ frame: frame.frame, device: frame.device, dt: frame.dt, time: Date.now(), socket: frame.socket }));
});
