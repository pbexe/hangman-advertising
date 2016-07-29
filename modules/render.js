var Canvas = require('canvas');
var width = 240;
var height = 480;
process.on("message", function(message) {
    message = JSON.parse(message);
    if (message.type == "dt"){
        var Image = Canvas.Image;
        var canvas = new Canvas(width, height, "svg");

        var bg = canvas.getContext("2d");
        bg.rect(0,0, canvas.width, canvas.height);
        var bg_gradient = bg.createRadialGradient(238, 50, 10, 238, 50, 300);
        bg_gradient.addColorStop(0, '#8ED6FF');
        bg_gradient.addColorStop(1, '#004CB3');
        bg.fillStyle = bg_gradient;
        bg.fill();

        var context = canvas.getContext('2d');

        context.font = '128px Impact';
        context.fillStyle = "black";
        context.rotate(0.1);
        context.fillText("Frame " + message.contents + "!", 50, 100);

        var te = context.measureText("Frame " + message.contents + "!");
        context.strokeStyle = 'rgba(0,0,0,0.5)';
        context.beginPath();
        context.lineTo(50, 102);
        context.lineTo(50 + te.width, 102);
        context.stroke();

        //require("fs").writeFile("out.svg", canvas.toBuffer());
        //console.log("data:image/svg+xml;utf8," + canvas.toBuffer().toString().replace(/[\r\n]/g, "").replace('<?xml version="1.0" encoding="UTF-8"?>', ""));

        process.send({
            frame: "data:image/svg+xml;utf8," + canvas.toBuffer().toString().replace(/[\r\n]/g, "").replace('<?xml version="1.0" encoding="UTF-8"?>', ""), dt: message.dt
        });
    }
    if (message.type == "constraints"){
        width = message.contents.width;
        height = message.contents.height;
    }
});
