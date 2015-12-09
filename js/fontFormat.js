var parseInput = require('./parseInput.js');
var toStr = require('./convertTimeFromSecondsToString.js');

module.exports = function (event) {
	var fontColor = "";
	var timeLeftSeconds = Infinity;
	switch (event.detail.type){
		case "up":
			if(event.detail.deadline !== "0:00"){
				timeLeftSeconds = parseInput(event.detail.deadline).value
					- event.detail.time;
			}
			break
		case "down":
		case "ddln":
			timeLeftSeconds = event.detail.time;
			break
	}
	if(timeLeftSeconds > 120){
		fontColor = "";
	} else if (timeLeftSeconds > 60) {
		fontColor = "#ffa500";
	} else if (timeLeftSeconds >= 0) {
		fontColor = "#f00";
	} else {
		fontColor = "#cc0066";
	}
	if(event.detail.type === "up"){
		timeLeftSeconds = event.detail.time;
	}
	var time = toStr(timeLeftSeconds);
    var fontSize = undefined;
    var minFontSize = 23;
    var maxFontSize = 40;
    var minStringLength = 4;
    var maxStringLength = 8;
    fontSize = Math.floor(minFontSize + (maxStringLength - time.length)
        * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));
    console.log("fontFormat: " + timeLeftSeconds + ", time: " + time);

	return {
		color: fontColor,
		size: fontSize + 'vw',
		time: time
	}
}
