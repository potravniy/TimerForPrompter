var Timer = require('./model.js');
var parseInput = require('./parseInput.js');

var Controller = function () {
    var $buttonCountUp = document.querySelector("button#up");
    var $buttonCountDown = document.querySelector("button#down");
    var $buttonCountDeadline = document.querySelector("button#deadline");
    var $buttonReset = document.querySelector("button#reset");
	var that = this;
	this._timer = null;
	this._buttonClickProcessing = function (event) {
		var input = parseInput();
		if(!input.isValid) return;
		switch (event.target || event.srcElement) {
			case $buttonCountUp :
				if(!that._timer){
					that._timer = new Timer("up", input.value);
				} else if (that._timer.type === "up" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "up" && that._timer.paused) {
					that._timer.run();
				}
				break
			case $buttonCountDown :
				if(!that._timer){
					that._timer = new Timer("down", input.value);
				} else if (that._timer.type === "down" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "down" && that._timer.paused) {
					that._timer.run();
				}
				break
			case $buttonCountDeadline :
				if(!that._timer){
					that._timer = new Timer("ddln", input.value);
				}
				break
			case $buttonReset :
				if (that._timer) that._timer.cancel();
				that._timer = null;
				break
		}
	}
	window.Tmr.$body.addEventListener("click", that._buttonClickProcessing);
}

module.exports = Controller;