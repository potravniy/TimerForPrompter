var parseInput = require('./parseInput.js');

module.exports = function (event) {
	var fontColor = "";
	var timeLeftSeconds = Infinity;
	var sign = "";
	switch (event.detail.type){
		case "up":
			if(event.detail.deadline !== "0:00"){
				timeLeftSeconds = parseInput(event.detail.deadline).value
					- parseInput(event.detail.time).value;
			}
			break
		case "down":
			timeLeftSeconds = parseInput(event.detail.time).value;
			break
		case "ddln":
			timeLeftSeconds = parseInput(event.detail.time).value;
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
		if (event.detail.type==="down" || event.detail.type==="ddln") sign="-";
	}
    var fontSize = undefined;
    var minFontSize = 23;
    var maxFontSize = 40;
    var minStringLength = 4;
    var maxStringLength = 8;
    fontSize = Math.floor(minFontSize 
    	+ (maxStringLength - event.detail.time.length)
        * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));

	return {
		color: fontColor,
		size: fontSize + 'vw',
		sign: sign
	}
}
