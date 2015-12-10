module.exports = function (event) {
	var fontColor = "",
		secondsLeft = event.detail.left;
	if(secondsLeft > 120){
		fontColor = "";
	} else if (secondsLeft > 60) {
		fontColor = "#ffa500";
	} else if (secondsLeft >= 0) {
		fontColor = "#f00";
	} else if (secondsLeft < 0) {
		fontColor = "#cc0066";
	}
    var fontSize = undefined,
		minFontSize = 23,
    	maxFontSize = 40,
    	minStringLength = 4,
    	maxStringLength = 8;
    fontSize = Math.floor(minFontSize + (maxStringLength - event.detail.time.length)
        * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));

	return {
		color: fontColor,
		size: fontSize + 'vw'
	}
}
