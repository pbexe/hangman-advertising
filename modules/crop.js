var cv = require("opencv");
var screensizes = [];

process.on("message", function(messagestring) {
    var message = JSON.parse(messagestring);
    if (message.type == "message") {
        screensizes.push(message.content);
    } else if (message.type == "frame") {
        for (screensize in screensizes) {
            (function(screensize){
                var v = screensizes[screensize].vertices;
                cv.readImage(message.content, function(err, mat) {
                    var srcArray = [v[0].x, v[0].y, v[1].x, v[1].y, v[2].x, v[2].y, v[3].x, v[3].y];
                    var dstArray = [v[0].x, v[0].y, v[0].x + screensizes[screensize].width, v[0].y, v[0].x + screensizes[screensize].width, v[0].y + screensizes[screensize].height, v[0].x, v[0].y + screensizes[screensize].height];
                    var transformationMatrix = im.getPerspectiveTransform(srcArray, dstArray);
                    im.warpPerspective(transformationMatrix, im.width(), im.height(), [255, 255, 255]);
                    console.log("hey");
                    im.save("/uploads/" + screensize + ".png");
                });
            })(screensize);
        }
    }
});
