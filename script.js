// Courtesy www.0AV.com, LGPL license or as set by forked host, Travis Holliday, https://codepen.io/travisholliday/pen/gyaJk (modified by fixing for browser security change)
var activeHouse;
var canvasContext;

function init() {
    activeHouse = "blue";
    canvasContext = $("#blueCanvas")[0].getContext("2d");
    var maxInfo = {"blue": 0, "green": 0, "yellow": 0, "red": 0};
    var colors = {"blue": "#2222FF", "green": "#00FF00", "yellow": "#DDDD00", "red": "#FF0000"}
    var accentColors = {"blue": "#000032", "green": "#003200", "yellow": "#444400", "red": "#320000"}

    for (const house in colors) {
        $("#" + house + "Canvas").css("background", colors[house]);
    }

    console.log("starting...");
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
                audio: true
            },
            function (stream) {
                audioContext = new AudioContext();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(javascriptNode);
                javascriptNode.connect(audioContext.destination);

                var rankingCanvasContext = $("#rankingCanvas")[0].getContext("2d");

                javascriptNode.onaudioprocess = function () {
                    var array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    var values = 0;

                    var length = array.length;
                    for (var i = 0; i < length; i++) {
                        values += (array[i]);
                    }

                    var average = values / length * 5;
                    maxInfo[activeHouse] = Math.max(maxInfo[activeHouse], average);

                    canvasContext.clearRect(0, 0, 500, 1000);
                    canvasContext.fillStyle = accentColors[activeHouse]; //was BadA55 (very cute)
                    canvasContext.fillRect(0, 1000 - average, 500, 1000);
                    canvasContext.fillStyle = '#FFFFFF';
                    canvasContext.fillRect(0, 1000 - maxInfo[activeHouse], 500, 15);
                    canvasContext.font = "144px impact";
                    canvasContext.fillText(Math.round(maxInfo[activeHouse]), 30, 150);
                    canvasContext.fillText(Math.round(average), 30, 960);

                    var sortedMaxInfo = [];
                    rankingCanvasContext.clearRect(0, 0, 500, 1000);
                    for (const house in maxInfo) {
                        sortedMaxInfo.push([house, maxInfo[house]])
                        rankingCanvasContext.fillStyle = colors[house];
                        rankingCanvasContext.fillRect(0, 1000 - maxInfo[house], 125, 15);
                    }
                    sortedMaxInfo.sort(function (a, b) {
                        return b[1] - a[1];
                    })
                    var offset = 150;
                    for (const pair in sortedMaxInfo) {
                        rankingCanvasContext.fillStyle = "#FFFFFF";
                        rankingCanvasContext.font = "72px impact"
                        rankingCanvasContext.textAlign = "right";
                        rankingCanvasContext.fillText(Math.round(maxInfo[sortedMaxInfo[pair][0]]), 275, 700 - offset);
                        rankingCanvasContext.fillStyle = colors[sortedMaxInfo[pair][0]];
                        rankingCanvasContext.textAlign = "left";
                        rankingCanvasContext.fillText(sortedMaxInfo[pair][0], 300, 700 - offset)
                        offset -= 100;
                    }
                }
            },
            function (err) {
                console.log("The following error occured: " + err.name)
            });
    } else {
        console.log("getUserMedia not supported");
    }
}

document.body.onkeyup = function (e) {
    if (e.key == " " ||
        e.code == "Space" ||
        e.keyCode == 32
    ) {
        if (activeHouse === "blue") {
            switchHouse("green");
        } else if (activeHouse === "green") {
            switchHouse("yellow");
        } else if (activeHouse === "yellow") {
            switchHouse("red");
        } else {
            switchHouse("blue")
        }
    }
}

function switchHouse(house) {
    $("#" + activeHouse).removeClass("active");
    $("#" + activeHouse).addClass("inactive");
    $("#" + house).removeClass("inactive");
    $("#" + house).addClass("active");

    activeHouse = house;
    canvasContext = $("#" + activeHouse + "Canvas")[0].getContext("2d");
}