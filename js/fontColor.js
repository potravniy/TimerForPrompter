var parseInput = require('./parseInput.js');

module.exports = function (event) {
	var fontColor = undefined;
	var timeInSeconds = parseInput(event.detail.time).value;
	if(event.detail.type === "countUp" || timeInSeconds > 119){
		fontColor = "";
	} else if (timeInSeconds > 59) {
		fontColor = "orange";
	} else {
		fontColor = "red";
	}
	return fontColor;
}
