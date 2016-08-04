var cv = require("opencv");
var screensizes = [];

process.on("message", function(messagestring) {
    var message = JSON.parse(messagestring);
    //console.log("Type: " + message.type);
    if (message.type == "screensize") {
        //console.log(message.content);
        screensizes.push(message.content);
    } else if (message.type == "frame") {
        if (screensizes.length > 0) {
            var buffer = new Buffer(message.content.data);
            /*
            cv.readImage("uploads/screen0pre.jpg", function(err, framebuffermat) {
                for (screensize in screensizes) {
                    console.log("screensize: " + screensize);

                    var mat = framebuffermat;
                    var v = screensizes[screensize].vertices;
                    var s = screensizes[screensize].screen;

                    console.log("v: " + JSON.stringify(v));
                    console.log("s: " + JSON.stringify(s));

                    console.log("Size: " + mat.width() + " x " + mat.height());
                    if (mat.width() < 1 || mat.height() < 1) throw new Error('Image has no size');

                    //console.log(err);
                    var srcArray;

                    var v1 = undefined, vminx = mat.width();
                    for (vertex in v) {
                        console.log("vminx: " + vminx);
                        console.log("v[" + vertex + "].x: " + v[vertex].x);
                        if (vminx > v[vertex].x) {
                            vminx = v[vertex].x;
                            v1 = vertex;
                        }
                    }

                    var v2 = undefined;
                    var v2minx = mat.width();

                    for (vertex in v) {
                        if ((v2minx > v[vertex].x) && (v1 != vertex)) {
                            v2minx = v[vertex].x;
                            v2 = vertex;
                        }
                    }

                    if (v[v1].y > v[v2].y) {
                        // Angled Right
                        srcArray = [v[1].x, v[1].y, v[0].x, v[0].y, v[3].x, v[3].y, v[2].x, v[2].y];
                        console.log("Angled Right");
                    } else {
                        // Angled Left
                        srcArray = [v[2].x, v[2].y, v[1].x, v[1].y, v[0].x, v[0].y, v[3].x, v[3].y];
                        console.log("Angled Left");
                    }

                    // If Point 1 => Point 2 > Point 1 => Point 4, then
                    // Point 1 is Top Right Corner

                    console.log("Points: " + JSON.stringify(v));
                    console.log("P1 => P2: " + (Math.sqrt(
                        Math.pow((v[parseInt(v1)].x - v[(parseInt(v1) + 1) % 4].x), 2)) +
                        Math.pow((v[parseInt(v1)].y - v[(parseInt(v1) + 1) % 4].y), 2)
                       ));
                    console.log("P1 => P4: " + (Math.sqrt(
                        Math.pow((v[parseInt(v1)].x - v[(parseInt(v1) + 3) % 4].x), 2)) +
                        Math.pow((v[parseInt(v1)].y - v[(parseInt(v1) + 3) % 4].y), 2)
                       ));

                    console.log("P1: " + v1 + " - " + v[v1]);
                    console.log("P2: " + ((parseInt(v1) + 1) % 4) + " - " + v[(parseInt(v1) + 1) % 4]);
                    console.log("P4: " + ((parseInt(v1) + 3) % 4) + " - " + v[(parseInt(v1) + 1) % 4]);



                    // If Point 1 => Point 2 < Point 1 => Point 4, then
                    // Point 1 is Top Right Corner

                    var dstArrayTmp = [0, 0, s.width, 0, s.width, s.height, 0, s.height];

                    console.log("v1: " + v1);
                    for (var i = 0; i < 4; i++) {
                        console.log(i + ": " + ((parseInt(v1) + i) % 4));
                    }

                    var dstArray = [0, 0, s.width, 0, s.width, s.height, 0, s.height];

                    console.log(srcArray);
                    console.log(dstArray);

                    var transformationMatrix = mat.getPerspectiveTransform(srcArray, dstArray);

                    //console.log(JSON.stringify({ matrix: transformationMatrix }));

                    mat.warpPerspective(transformationMatrix, s.width, s.height, [255, 255, 255]);
                    console.log("hey");
                    mat.save("uploads/" + screensize + ".png");
                }
            });*/

            for (screensize in screensizes) {
                (function(screensize) {
                    cv.readImage("uploads/screen0pre.jpg", function(err, mat) {
                        console.log("screensize: " + screensize);
                        var v = screensizes[screensize].vertices;
                        var s = screensizes[screensize].screen;

                        console.log("v: " + JSON.stringify(v));
                        console.log("s: " + JSON.stringify(s));

                        console.log("Size: " + mat.width() + " x " + mat.height());
                        if (mat.width() < 1 || mat.height() < 1) throw new Error('Image has no size');

                        //console.log(err);
                        var srcArray;

                        var v1 = undefined, vminx = mat.width();
                        for (vertex in v) {
                            console.log("vminx: " + vminx);
                            console.log("v[" + vertex + "].x: " + v[vertex].x);
                            if (vminx > v[vertex].x) {
                                vminx = v[vertex].x;
                                v1 = vertex;
                            }
                        }

                        var v2 = undefined;
                        var v2minx = mat.width();

                        for (vertex in v) {
                            if ((v2minx > v[vertex].x) && (v1 != vertex)) {
                                v2minx = v[vertex].x;
                                v2 = vertex;
                            }
                        }

                        if (v[v1].y > v[v2].y) {
                            // Angled Right
                            srcArray = [v[1].x, v[1].y, v[0].x, v[0].y, v[3].x, v[3].y, v[2].x, v[2].y];
                            console.log("Angled Right");
                        } else {
                            // Angled Left
                            srcArray = [v[2].x, v[2].y, v[1].x, v[1].y, v[0].x, v[0].y, v[3].x, v[3].y];
                            console.log("Angled Left");
                        }

                        // If Point 1 => Point 2 > Point 1 => Point 4, then
                        // Point 1 is Top Right Corner

                        console.log("Points: " + JSON.stringify(v));
                        console.log("P1 => P2: " + (Math.sqrt(
                            Math.pow((v[parseInt(v1)].x - v[(parseInt(v1) + 1) % 4].x), 2)) +
                            Math.pow((v[parseInt(v1)].y - v[(parseInt(v1) + 1) % 4].y), 2)
                           ));
                        console.log("P1 => P4: " + (Math.sqrt(
                            Math.pow((v[parseInt(v1)].x - v[(parseInt(v1) + 3) % 4].x), 2)) +
                            Math.pow((v[parseInt(v1)].y - v[(parseInt(v1) + 3) % 4].y), 2)
                           ));

                        console.log("P1: " + v1 + " - " + v[v1]);
                        console.log("P2: " + ((parseInt(v1) + 1) % 4) + " - " + v[(parseInt(v1) + 1) % 4]);
                        console.log("P4: " + ((parseInt(v1) + 3) % 4) + " - " + v[(parseInt(v1) + 1) % 4])

                        /*if ((Math.sqrt(
                            Math.pow((v[parseInt(v1)].x - v[(parseInt(v1) + 1) % 4].x), 2)) +
                            Math.pow((v[parseInt(v1)].y - v[(parseInt(v1) + 1) % 4].y), 2)
                           ) > (Math.sqrt(
                            Math.pow((v[parseInt(v1)].x - v[(parseInt(v1) + 3) % 4].x), 2)) +
                            Math.pow((v[parseInt(v1)].y - v[(parseInt(v1) + 3) % 4].y), 2)
                           )) {
                            srcArray = [v[(parseInt(v1) + 2) % 4].x, v[(parseInt(v1) + 2) % 4].y, v[(parseInt(v1) + 1) % 4].x, v[(parseInt(v1) + 1) % 4].y, v[(parseInt(v1) + 0) % 4].x, v[(parseInt(v1) + 0) % 4].y, v[(parseInt(v1) + 3) % 4].x, v[(parseInt(v1) + 3) % 4].y];
                            console.log("Angled Left");
                        } else {
                            srcArray = [v[(parseInt(v1) + 1) % 4].x, v[(parseInt(v1) + 1) % 4].y, v[(parseInt(v1) + 0) % 4].x, v[(parseInt(v1) + 0) % 4].y, v[(parseInt(v1) + 3) % 4].x, v[(parseInt(v1) + 3) % 4].y, v[(parseInt(v1) + 2) % 4].x, v[(parseInt(v1) + 2) % 4].y];
                            console.log("Angled Right");
                        }*/



                        // If Point 1 => Point 2 < Point 1 => Point 4, then
                        // Point 1 is Top Right Corner

                        var dstArrayTmp = [0, 0, s.width, 0, s.width, s.height, 0, s.height];

                        console.log("v1: " + v1);
                        for (var i = 0; i < 4; i++) {
                            console.log(i + ": " + ((parseInt(v1) + i) % 4));
                        }

                        var dstArray = [0, 0, s.width, 0, s.width, s.height, 0, s.height];

                        console.log(srcArray);
                        console.log(dstArray);

                        var transformationMatrix = mat.getPerspectiveTransform(srcArray, dstArray);

                        //console.log(JSON.stringify({ matrix: transformationMatrix }));

                        mat.warpPerspective(transformationMatrix, s.width, s.height, [255, 255, 255]);
                        console.log("hey");
                        console.log(JSON.stringify(s));
                        process.send(JSON.stringify({ frame: mat.toBuffer().toString("base64"), dt: message.dt, socket: s.id }));
                    });
                })(screensize);
            }
        }
    }
});
