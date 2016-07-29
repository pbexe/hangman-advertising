var Canvas = require('canvas');

process.on("message", function(dt) {
    var Image = Canvas.Image;
    var canvas = new Canvas(800, 800, "svg");

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
    context.fillText("Frame " + dt + "!", 50, 100);

    var te = context.measureText("Frame " + dt + "!");
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.beginPath();
    context.lineTo(50, 102);
    context.lineTo(50 + te.width, 102);
    context.stroke();

    //require("fs").writeFile("out.svg", canvas.toBuffer());
    //console.log("data:image/svg+xml;utf8," + canvas.toBuffer().toString().replace(/[\r\n]/g, "").replace('<?xml version="1.0" encoding="UTF-8"?>', ""));

    process.send({ frame: "data:image/svg+xml;utf8," + canvas.toBuffer().toString().replace(/[\r\n]/g, "").replace('<?xml version="1.0" encoding="UTF-8"?>', ""), dt: dt });
});
