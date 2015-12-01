(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Timer = require('./model.js');
var parseInput = require('./parseInput.js');

var Controller = function () {
	var that = this;
	this._timer = null;
	this._buttonClickProcessing = function (event) {
		var input = parseInput();
		if(!input.isValid) throw "Wrong input.";
		switch (event.target || event.srcElement) {
			case window.Prompter.$buttonCountUp :
				if(!that._timer){
					that._timer = new Timer("countUp", input.value);
				} else if (that._timer.type === "countUp" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "countUp" && that._timer.paused) {
					that._timer.run();
				}
				break
			case window.Prompter.$buttonCountDown :
				if(!that._timer){
					that._timer = new Timer("countDown", input.value);
				} else if (that._timer.type === "countDown" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "countDown" && that._timer.paused) {
					that._timer.run();
				}
				break
			case window.Prompter.$buttonCountDeadline :
				if(!that._timer){
					that._timer = new Timer("deadline", input.value);
				}
				break
			case window.Prompter.$buttonReset :
				if (that._timer) that._timer.cancel();
				that._timer = null;
				break
		}
	}
	window.Prompter.$body.addEventListener("click", that._buttonClickProcessing);
}

module.exports = Controller;
},{"./model.js":8,"./parseInput.js":9}],2:[function(require,module,exports){
module.exports = function (timeInSeconds, fullFormat) {
    var h = Math.floor(timeInSeconds / (3600));
    var m = Math.floor((timeInSeconds - h * 3600) / 60);
    var s = Math.floor(timeInSeconds - h * 3600 - m * 60);
    var timeString = ":" + (s < 10 ? "0" + s : s);
    if(fullFormat){
        timeString = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + timeString;
    }else {
        if (h > 0) {
            timeString = h + ":" + (m < 10 ? "0" + m : m) + timeString;
        } else {
            timeString = m + timeString;
        }
    }
    return timeString;
}

},{}],3:[function(require,module,exports){
module.exports = function () {
	var temp = window.Prompter.View.$messageDivSecondDispl.textContent;
	window.Prompter.View.$messageDivSecondDispl.textContent = "";
	var scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if (!scrollHeight) scrollHeight = window.Prompter.View.$messageDivSecondDispl.scrollHeight;
		if(toggle){
			window.Prompter.View.$messageDivSecondDispl.textContent = temp;
			toggle = false;
		} else {
			if(window.Prompter.View.$messageDivSecondDispl.scrollHeight > scrollHeight){
				temp = window.Prompter.View.$messageDivSecondDispl.textContent.slice(0, -1);
				toggle = true;
			} else {
				clearInterval(id);
				window.Prompter.$showMessage.textContent = temp;
			}
		}
	}
}
},{}],4:[function(require,module,exports){
module.exports = function (eventName, customEventInit) {
    var evnt = new CustomEvent(eventName, customEventInit);
    Prompter.$body.dispatchEvent(evnt);
}
},{}],5:[function(require,module,exports){
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

},{"./parseInput.js":9}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
window.onload = function () {
   window.Prompter = {
        $body: document.querySelector("body"),
        $buttonCountUp: document.querySelector("button#up"),
        $buttonCountDown: document.querySelector("button#down"),
        $inputAndDisplayTime: document.querySelector("input#time"),
        $buttonCountDeadline: document.querySelector("button#deadline_start"),
        $buttonReset: document.querySelector("button#reset"),
        $inputMessage: document.querySelector("textarea#message"),
        $showTimeLeft: document.querySelector("div#time_left"),
        $showMessage: document.querySelector("div#message_show"),
        View: {}
    };
	var Controller = require('./controller.js');
	var View = require("./view.js");
    require('./secondsEventEmitter.js');
    var controller = new Controller();
    var view = new View();
}
},{"./controller.js":1,"./secondsEventEmitter.js":10,"./view.js":11}],8:[function(require,module,exports){
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
},{"./convertTimeFromSecondsToString.js":2,"./emitEvent":4}],9:[function(require,module,exports){
module.exports = function (timeString) {
    if(!timeString){
        timeString = (Prompter.$inputAndDisplayTime.value ? Prompter.$inputAndDisplayTime.value : 0);
    }
    var result = {
        value: NaN,
        isValid: false
    }
    if (isNaN(timeString)) {
        var validChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ":"];
        var timeNumber = 0;
        for (var i = 0; i < timeString.length; i++) {
            var isCharValid = validChars.some(function (item) {
                return timeString[i] == item;
            })
            if (!isCharValid) {
                alert("Допустимо вводить только цифры и двоеточия.");
                return result
            }
            if (timeString[i] !== ":") timeNumber = timeNumber * 10 + (+timeString[i]);
        }
    } else timeNumber = timeString;

    var hours = Math.floor(timeNumber / 10000);
    if (hours > 23) {
        alert("Значение 'часов' больше 23.");
        return result
    }
    var minutes = Math.floor((timeNumber - hours * 10000) / 100);
    if (minutes > 59) {
        alert("Значение 'минут' больше 59.");
        return result
    }
    var seconds = Math.floor(timeNumber - hours * 10000 - minutes * 100);
    if (seconds > 59) {
        alert("Значение 'секунд' больше 59.");
        return result
    }
    var timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return result = {
        value: timeInSeconds,
        isValid: true
    }
}

},{}],10:[function(require,module,exports){
var emit = require('./emitEvent');
var currentTimeInSeconds = Math.floor(Date.now() / 1000);
var intervalID = setInterval(emitEventEverySecond, 100);

function emitEventEverySecond() {
    var newTimeInSeconds = Math.floor(Date.now() / 1000);
    if (currentTimeInSeconds !== newTimeInSeconds) {
        currentTimeInSeconds = newTimeInSeconds;
        emit('newSecond');
    }
}


},{"./emitEvent":4}],11:[function(require,module,exports){
/* global Prompter */
var parseInput = require('./parseInput.js');
var toStr = require('./convertTimeFromSecondsToString.js');
var fontSize = require("./fontSize.js");
var fontColor = require("./fontColor.js");
var cutContentToFitDiv = require("./cutContentToFitDiv.js")

var View = function () {
	var that = this;
	this._prompterWindow = undefined;
	this._$timeOnPrompter = null;
	window.Prompter.View.$messageDivSecondDispl = null;
	this._$prompterWindowButtonOnOff = document.querySelector("button#screen2");
	Prompter.$showMessage.textContent = "Нет окна суфлера";

	this._processKeyDown = function (event) {
	    if (event.keyCode === 13) {
	        that._processMessage();
	        event.preventDefault();
	    } else if (event.keyCode === 27) {
	        Prompter.$inputMessage.textContent = "";
	    }
	}
	this._processMessage = function () {
	    if (window.Prompter.View.$messageDivSecondDispl) {
	        that._showMessage();
	    } else {
	    	that._openPrompterWindow();
	    	Prompter.$showMessage.textContent = "Нет окна суфлера";
	    }
	}
	this._showMessage = function () {
	        window.Prompter.View.$messageDivSecondDispl.textContent = Prompter.$showMessage.textContent = Prompter.$inputMessage.value;
	        Prompter.$inputMessage.value = "";
	        cutContentToFitDiv();
	}
	this._timerStarted = function(event) {
		switch (event.detail.type) {
			case "countUp":
				Prompter.$inputAndDisplayTime.value = event.detail.deadline;
				Prompter.$buttonCountUp.style["background-color"] = "#0f0";
				Prompter.$buttonCountUp.innerHTML = "Прямой отсчет<br>пауза";
				that._showTimeOnPrompter(event);
				break
			case "countDown":
				Prompter.$inputAndDisplayTime.value = event.detail.time;
				Prompter.$buttonCountDown.style["background-color"] = "#0f0";
				Prompter.$buttonCountDown.innerHTML = "Обратный отсчет<br>пауза";
				that._showTimeOnPrompter(event);
				break
			case "deadline":
				Prompter.$inputAndDisplayTime.value = event.detail.deadline;
				Prompter.$buttonCountDeadline.style["background-color"] = "#0f0";
				that._showTimeOnPrompter(event);
				break
		}
	}
	this._timerPaused = function(event) {
		that._showTimeOnPrompter(event)
		switch (event.detail.type) {
		case "countUp":
			Prompter.$buttonCountUp.innerHTML = "Прямой отсчет<br>пуск";
			break
		case "countDown":
			Prompter.$buttonCountDown.innerHTML = "Обратный отсчет<br>пуск";
			break
		}
	}
	this._timerRun = function(event) {
		that._showTimeOnPrompter(event)
		switch (event.detail.type) {
		case "countUp":
			Prompter.$buttonCountUp.innerHTML = "Прямой отсчет<br>пауза";
			break
		case "countDown":
			Prompter.$buttonCountDown.innerHTML = "Обратный отсчет<br>пауза";
			break
		}
	}
	this._timerCancelled = function(event) {
		that._$timeOnPrompter.textContent = Prompter.$showTimeLeft.textContent = "";
		that._$timeOnPrompter.style.color = Prompter.$showTimeLeft.style.color = "";	
	    Prompter.$inputAndDisplayTime.value = "";
	    Prompter.$inputAndDisplayTime.style["background-color"] = "";
		switch (event.detail.type) {
			case "countUp":
				Prompter.$buttonCountUp.style["background-color"] = "";
				Prompter.$buttonCountUp.innerHTML = "Прямой отсчет<br>пуск";
				break
			case "countDown":
				Prompter.$buttonCountDown.style["background-color"] = "";
				Prompter.$buttonCountDown.innerHTML = "Обратный отсчет<br>пуск";
				break
			case "deadline":
				Prompter.$buttonCountDeadline.style["background-color"] = "";
				break
		}
	}
	this._timeOver = function(event) {
		that._showTimeOnPrompter(event)
	    Prompter.$inputAndDisplayTime.style["background-color"] = "#f00";
	}
	this._openPrompterWindow = function() {
	    var strWindowFeatures = "menubar=no, location=no, locationbar=no, toolbar=no, personalbar=no, status=no, resizable=yes, scrollbars=no,status=no";
	    var strWindowPositionAndSize = "height=300,width=500";
	    that._prompterWindow = window.open("prompter.html", "prompter", strWindowPositionAndSize + "," + strWindowFeatures);
	    if(!that._prompterWindow) return;
	    that._prompterWindow.addEventListener('load', function () {
	        that._$timeOnPrompter = that._prompterWindow.document.querySelector("div#time_left");
	        window.Prompter.View.$messageDivSecondDispl = that._prompterWindow.document.querySelector("div#message_show");
	        that._$prompterWindowButtonOnOff.innerHTML = "Закрыть<br>второе<br>окно";
	        that._showMessage();
		    window.addEventListener('unload', that._prompterWindowCloseFunc);
	        that._prompterWindow.addEventListener('unload', that._closePrompterWindow);
	        that._prompterWindow.addEventListener('resize', that.cutContentToFitDiv);
	    });
	}
	this._closePrompterWindow = function() {
	    window.removeEventListener('unload', that._prompterWindowCloseFunc);
	    that._prompterWindow.removeEventListener('unload', that._closePrompterWindow);
	    that._prompterWindow.removeEventListener('resize', that._showMessage);
	    that._prompterWindow.close();
		that._prompterWindow = undefined;
		that._$timeOnPrompter = null;
		window.Prompter.View.$messageDivSecondDispl = null;
    	that._$prompterWindowButtonOnOff.innerHTML = "Создать<br>второе<br>окно";
    	Prompter.$showMessage.textContent = "Нет окна суфлера";
	}
	this._prompterWindowOnOff = function () {
	    if (that._prompterWindow) that._closePrompterWindow();
	    else that._openPrompterWindow();
	}
	this._prompterWindowCloseFunc = function () {
	    if (that._prompterWindow) that._closePrompterWindow();
	}
	this._showTimeOnPrompter = function(event){
		if (that._$timeOnPrompter) {
            that._$timeOnPrompter.style['font-size'] = fontSize(event) + 'vw';
			that._$timeOnPrompter.style.color = Prompter.$showTimeLeft.style.color = fontColor(event);
			that._$timeOnPrompter.textContent = Prompter.$showTimeLeft.textContent = event.detail.time;
		}
		else {
			Prompter.$showMessage.textContent = "Нет окна суфлера";
			that._openPrompterWindow();
		}
	}

	Prompter.$inputAndDisplayTime.addEventListener('change', function () {
	    var input = parseInput();
	    if (input.isValid) Prompter.$inputAndDisplayTime.value = toStr(input.value);
	});
	this._$prompterWindowButtonOnOff.addEventListener('click', that._prompterWindowOnOff);
	Prompter.$inputMessage.addEventListener("keydown", that._processKeyDown);
	Prompter.$body.addEventListener('timerStarted', that._timerStarted);
	Prompter.$body.addEventListener('timerChanged', that._showTimeOnPrompter);
	Prompter.$body.addEventListener('timerPaused', that._timerPaused);
	Prompter.$body.addEventListener('timerRun', that._timerRun);
	Prompter.$body.addEventListener('timerCancelled', that._timerCancelled);
	Prompter.$body.addEventListener('timeOver', that._timeOver);
}

module.exports = View;
},{"./convertTimeFromSecondsToString.js":2,"./cutContentToFitDiv.js":3,"./fontColor.js":5,"./fontSize.js":6,"./parseInput.js":9}]},{},[7]);
