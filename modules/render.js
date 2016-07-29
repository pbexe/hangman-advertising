var Canvas = require('canvas');

process.on("message", function(dt) {
    var Image = Canvas.Image;
    var canvas = new Canvas(800, 800);
    var context = canvas.getContext('2d');

    context.font = '128px Impact';
    context.rotate(dt / 10);
    context.fillText("Frame " + dt + "!", 50, 100);

    var te = context.measureText("Frame " + dt + "!");
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.beginPath();
    context.lineTo(50, 102);
    context.lineTo(50 + te.width, 102);
    context.stroke();

    process.send({ frame: canvas.toDataURL(), dt: dt });
});
