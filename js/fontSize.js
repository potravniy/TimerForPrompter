module.exports = function (event) {
    var fontSize = undefined;
    var minFontSize = 23;
    var maxFontSize = 40;
    var minStringLength = 4;
    var maxStringLength = 8;
    fontSize = Math.floor(minFontSize 
    	+ (maxStringLength - event.detail.time.length) * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));
	return fontSize;
}