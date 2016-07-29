var Canvas = require('canvas');

process.on("message", function(m) {
    var Image = Canvas.Image;
    var canvas = new Canvas(200, 200);
    var context = canvas.getContext('2d');

    context.font = '30px Impact';
    context.rotate(.1);
    context.fillText("Awesome!", 50, 100);

    var te = context.measureText('Awesome!');
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.beginPath();
    context.lineTo(50, 102);
    context.lineTo(50 + te.width, 102);
    context.stroke();

    process.send(canvas.toDataURL());
});
