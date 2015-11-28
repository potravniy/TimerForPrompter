var Timer = require('./model.js');
var parseInput = require('./parseInput.js');

var Controller = function () {
	var that = this;
	this._timer = null;
	this._buttonClickProcessing = function (event) {
		var input = parseInput();
		if(!input.isValid) throw "Wrong input.";
		switch (event.target || event.srcElement) {
			case Prompter.$buttonCountUp :
				if(!that._timer){
					that._timer = new Timer("countUp", input.value);
				} else if (that._timer.type === "countUp" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "countUp" && that._timer.paused) {
					that._timer.run();
				}
				break
			case Prompter.$buttonCountDown :
				if(!that._timer){
					that._timer = new Timer("countDown", input.value);
				} else if (that._timer.type === "countDown" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "countDown" && that._timer.paused) {
					that._timer.run();
				}
				break
			case Prompter.$buttonCountDeadline :
				if(!that._timer){
					that._timer = new Timer("deadline", input.value);
				}
				break
			case Prompter.$buttonReset :
				if (that._timer) that._timer.cancel();
				that._timer = null;
				break
		}
	}
	Prompter.$body.addEventListener("click", that._buttonClickProcessing);
}

module.exports = Controller;