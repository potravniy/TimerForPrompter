var toStr = require("./convertTimeFromSecondsToString.js");
var emit = require("./emitEvent");

var Timer = function (typeOfTimer, enteredSeconds) {
	var that = this;
	this.emit = emit;
	this.type = typeOfTimer;
	switch (typeOfTimer){
	case "up":
		this.timerValue = 0;
		this.deadline = enteredSeconds;
		this.secLeft = (this.deadline > 0 ? 
			this.deadline - this.timerValue : Infinity);
		this.timeLeft = function (){
			that.timerValue++;
			that.secLeft = (that.deadline > 0 ? 
				that.deadline - that.timerValue : Infinity);
			that.emit('timerChanged', customDetail());
			if(that.secLeft === 0) {
				// that.pause();
				that.emit('timeOver', customDetail());
			}
		}
		this.pause = function(){
			window.Tmr.$body.removeEventListener('newSecond', that.timeLeft);
			that.paused = true;
			that.emit('timerPaused', customDetail());
		}
		this.run = function(){
			window.Tmr.$body.addEventListener('newSecond', that.timeLeft);
			that.paused = false;
			that.emit('timerRun', customDetail());
		}
		break
	case "down":
		this.timerValue = (enteredSeconds ? enteredSeconds : 3599);
		this.deadline = 0;
		this.secLeft = this.timerValue;
		this.timeLeft = function (){
			that.timerValue--;
			that.secLeft = that.timerValue;
			that.emit('timerChanged', customDetail());
			if(that.timerValue === 0) {
				// that.pause();
				that.emit('timeOver', customDetail());
			}
		}
		this.pause = function(){
			window.Tmr.$body.removeEventListener('newSecond', that.timeLeft);
			that.paused = true;
			that.emit('timerPaused', customDetail());
		}
		this.run = function(){
			window.Tmr.$body.addEventListener('newSecond', that.timeLeft);
			that.paused = false;
			that.emit('timerRun', customDetail());
		}
		break
	case "ddln":
		var enteredTime = toStr(enteredSeconds, true);
		this.deadline = new Date();
		this.deadline.setHours(+enteredTime.substring(0, 2));
		this.deadline.setMinutes(+enteredTime.substring(3, 5));
		this.deadline.setSeconds(+enteredTime.substring(6));
		if (this.deadline < new Date()) {
			this.deadline.setDate(this.deadline.getDate() + 1);
		}
		this.deadline.toStr = function() {
			return (that.deadline.getHours()+':'+that.deadline.getMinutes()
				+ ':' + that.deadline.getSeconds());
		}
		this.timerValue = Math.floor((this.deadline - new Date()) / 1000);
		this.secLeft = this.timerValue;
		this.timeLeft = function () {
			that.timerValue = Math.floor((that.deadline - new Date())/1000);
			that.secLeft = that.timerValue;
			that.emit('timerChanged', customDetail());
			if (that.timerValue === 0){
				// window.Tmr.$body.removeEventListener('newSecond'
				// 	, that.timeLeft);
				that.emit('timeOver', customDetail());
			}
		}
		break
	}
	this.cancel = function(){
		window.Tmr.$body.removeEventListener('newSecond', that.timeLeft);
		that.emit('timerCancelled', customDetail());
	}
	this.emit('timerStarted', customDetail());
	window.Tmr.$body.addEventListener('newSecond', that.timeLeft);
	function customDetail() {
		return {
			detail: {
				type: typeOfTimer,
				time: toStr(that.timerValue),
				left: that.secLeft,
				deadline: (typeOfTimer === "ddln" ? 
					that.deadline.toStr() : toStr(that.deadline))
			}
		}	
	} 
}

module.exports = Timer;