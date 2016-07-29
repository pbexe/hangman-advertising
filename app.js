var fs = require("fs");
var child_process = require('child_process');

// Clients
var clients = child_process.fork("modules/clients.js");

// Delta Time
var dt = 0;

// Render Loop
setInterval(function() {
    var slave = child_process.fork("modules/render.js");

    slave.send(dt);
    dt++;

    slave.on("message", function(frame) {
        clients.send(JSON.stringify({ frame: frame.frame, dt: frame.dt, time: Date.now() }));
        slave.kill("SIGINT");
    });
}, 33);
