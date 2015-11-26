var convertToString = require("./convertTimeFromSecondsToString.js");

var Timer = function (typeOfTimer, enteredTimeInSeconds) {
	var that = this;
	this.timerValue = enteredTimeInSeconds;
	this.emit = require("./emitEvent");
	this.type = typeOfTimer;
	switch (typeOfTimer){
		case "countUp":
			this.countUp = function (){
				that.timerValue++;
				that.emit('timerChanged', customEventInit(that.timerValue));
			};
			Prompter.$body.addEventListener('newSecond', that.countUp);
			this.pause = function(){
				Prompter.$body.removeEventListener('newSecond', that.countUp);
				that.paused = true;
				that.emit('timerPaused', customEventInit(that.timerValue));
			}
			this.run = function(){
				Prompter.$body.addEventListener('newSecond', that.countUp);
				that.paused = false;
				that.emit('timerRun', customEventInit(that.timerValue));
			}
			this.cancel = function(){
				Prompter.$body.removeEventListener('newSecond', that.countUp);
				that.emit('timerCancelled', {detail: {type: "countUp"}});
			}
			this.emit('timerStarted', customEventInit(that.timerValue));
			break
		case "countDown":
			this.countDown = function (){
				that.timerValue--;
				that.emit('timerChanged', customEventInit(that.timerValue));
				if(that.timerValue === 0) {
					that.pause();
					that.emit('timeOver', customEventInit(that.timerValue));
				}
			};
			Prompter.$body.addEventListener('newSecond', that.countDown);
			this.pause = function(){
				Prompter.$body.removeEventListener('newSecond', that.countDown);
				that.paused = true;
				that.emit('timerPaused', customEventInit(that.timerValue));
			}
			this.run = function(){
				Prompter.$body.addEventListener('newSecond', that.countDown);
				that.paused = false;
				that.emit('timerRun', customEventInit(that.timerValue));
			}
			this.cancel = function(){
				Prompter.$body.removeEventListener('newSecond', that.countDown);
				that.emit('timerCancelled', customEventInit(that.timerValue));
			}
			this.emit('timerStarted', customEventInit(that.timerValue));
			break
		case "deadline":
			var enteredTime = convertToString(enteredTimeInSeconds, true);
			var eventInit = {
				detail: {
					type: typeOfTimer,
					time: enteredTime
				}
			}
			this.emit('timerStarted', eventInit);
			this.timerValue = new Date();
			this.timerValue.setHours(+enteredTime.substring(0, 2));
			this.timerValue.setMinutes(+enteredTime.substring(3, 5));
			this.timerValue.setSeconds(+enteredTime.substring(6));
			if (this.timerValue < new Date()) {
				this.timerValue.setDate(this.timerValue.getDate() + 1);
			}
			console.log("this.timerValue: " + this.timerValue + ", new Date(): " + (new Date()));
			this.timeLeft = function () {
				var leftSeconds = Math.floor((that.timerValue - new Date()) / 1000);
				that.emit('timerChanged', customEventInit(leftSeconds));
				if (leftSeconds === 0){
					Prompter.$body.removeEventListener('newSecond', that.timeLeft);
					that.emit('timeOver', customEventInit(leftSeconds));
				};
			}
			Prompter.$body.addEventListener('newSecond', that.timeLeft);
			this.cancel = function(){
				Prompter.$body.removeEventListener('newSecond', that.timeLeft);
				that.emit('timerCancelled', customEventInit(that.timerValue));
			}
			break
	}
	function customEventInit(time) {
		return {
			detail: {
				type: typeOfTimer,
				time: convertToString(time)
			}
		}	
	} 
	return this;
}

module.exports = Timer;