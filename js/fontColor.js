var parseInput = require('./parseInput.js');

module.exports = function (event) {
	var fontColor = "";
	var timeLeftSeconds = Infinity;
	switch (event.detail.type){
		case "countUp":
			if(event.detail.deadline !== "0:00"){
				timeLeftSeconds = parseInput(event.detail.deadline).value - parseInput(event.detail.time).value;
			}
			break
		case "countDown":
			timeLeftSeconds = parseInput(event.detail.time).value;
			break
		case "deadline":
			timeLeftSeconds = parseInput(event.detail.time).value;
			break
	}
	if(timeLeftSeconds > 120){
		fontColor = "";
	} else if (timeLeftSeconds > 60) {
		fontColor = "orange";
	} else {
		fontColor = "red";
	}
	return fontColor;
}
