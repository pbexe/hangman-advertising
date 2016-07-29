var Canvas = require('canvas');

process.on("message", function(dt) {
    var Image = Canvas.Image;
    var canvas = new Canvas(800, 800);

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

    process.send({ frame: canvas.toDataURL(), dt: dt });
});
