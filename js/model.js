var convertToString = require("./convertTimeFromSecondsToString.js");
var emit = require("./emitEvent");

var Timer = function (typeOfTimer, enteredTimeInSeconds) {
	var that = this;
	this.emit = emit;
	this.type = typeOfTimer;
	switch (typeOfTimer){
		case "countUp":
			this.timerValue = 0;
			this.deadline = enteredTimeInSeconds;
			this.timeLeft = function (){
				that.timerValue++;
				that.emit('timerChanged', customDetail());
				if(that.timerValue === that.deadline && that.deadline) {
					that.pause();
					that.emit('timeOver', customDetail());
				}
			}
			this.pause = function(){
				window.Prompter.$body.removeEventListener('newSecond', that.timeLeft);
				that.paused = true;
				that.emit('timerPaused', customDetail());
			}
			this.run = function(){
				window.Prompter.$body.addEventListener('newSecond', that.timeLeft);
				that.paused = false;
				that.emit('timerRun', customDetail());
			}
			break
		case "countDown":
			this.timerValue = (enteredTimeInSeconds) ? enteredTimeInSeconds : 3599;
			this.deadline = 0;
			this.timeLeft = function (){
				that.timerValue--;
				that.emit('timerChanged', customDetail());
				if(that.timerValue === 0) {
					that.pause();
					that.emit('timeOver', customDetail());
				}
			}
			this.pause = function(){
				window.Prompter.$body.removeEventListener('newSecond', that.timeLeft);
				that.paused = true;
				that.emit('timerPaused', customDetail());
			}
			this.run = function(){
				window.Prompter.$body.addEventListener('newSecond', that.timeLeft);
				that.paused = false;
				that.emit('timerRun', customDetail());
			}
			break
		case "deadline":
			var enteredTime = convertToString(enteredTimeInSeconds, true);
			this.deadline = new Date();
			this.deadline.setHours(+enteredTime.substring(0, 2));
			this.deadline.setMinutes(+enteredTime.substring(3, 5));
			this.deadline.setSeconds(+enteredTime.substring(6));
			if (this.deadline < new Date()) {
				this.deadline.setDate(this.deadline.getDate() + 1);
			}
			this.deadline.fromDateToString = function() {
				return (that.deadline.getHours() + ':' + that.deadline.getMinutes() + ':' + that.deadline.getSeconds());
			}
			this.timerValue = Math.floor((this.deadline - new Date()) / 1000);
			this.timeLeft = function () {
				that.timerValue = Math.floor((that.deadline - new Date()) / 1000);
				that.emit('timerChanged', customDetail());
				if (that.timerValue === 0){
					window.Prompter.$body.removeEventListener('newSecond', that.timeLeft);
					that.emit('timeOver', customDetail());
				}
			}
			break
	}
	this.cancel = function(){
		window.Prompter.$body.removeEventListener('newSecond', that.timeLeft);
		that.emit('timerCancelled', customDetail());
	}
	this.emit('timerStarted', customDetail());
	window.Prompter.$body.addEventListener('newSecond', that.timeLeft);
	function customDetail() {
		return {
			detail: {
				type: typeOfTimer,
				time: convertToString(that.timerValue),
				deadline: (typeOfTimer === "deadline") ? that.deadline.fromDateToString() : convertToString(that.deadline)
			}
		}	
	} 
	return this;
}

module.exports = Timer;