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
module.exports = function ($messageDivSecondDispl) {
	var temp = $messageDivSecondDispl.textContent;
	$messageDivSecondDispl.textContent = "";
	var scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if (!scrollHeight) scrollHeight = $messageDivSecondDispl.scrollHeight;
		if(toggle){
			$messageDivSecondDispl.textContent = temp;
			toggle = false;
		} else {
			if($messageDivSecondDispl.scrollHeight > scrollHeight){
				temp = $messageDivSecondDispl.textContent.slice(0, -1);
				toggle = true;
			} else {
				clearInterval(id);
				Prompter.$showMessage.textContent = temp;
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
	var Controller = require('./controller.js');
	var View = require("./view.js");
    window.Prompter = {
        $body: document.querySelector("body"),
        $buttonCountUp: document.querySelector("button#up"),
        $buttonCountDown: document.querySelector("button#down"),
        $inputAndDisplayTime: document.querySelector("input#time"),
        $buttonCountDeadline: document.querySelector("button#deadline_start"),
        $buttonReset: document.querySelector("button#reset"),
        $inputMessage: document.querySelector("textarea#message"),
        $showTimeLeft: document.querySelector("div#time_left"),
        $showMessage: document.querySelector("div#message_show")
    }
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
				Prompter.$body.removeEventListener('newSecond', that.timeLeft);
				that.paused = true;
				that.emit('timerPaused', customDetail());
			}
			this.run = function(){
				Prompter.$body.addEventListener('newSecond', that.timeLeft);
				that.paused = false;
				that.emit('timerRun', customDetail());
			}
			break
		case "countDown":
			this.timerValue = enteredTimeInSeconds;
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
				Prompter.$body.removeEventListener('newSecond', that.timeLeft);
				that.paused = true;
				that.emit('timerPaused', customDetail());
			}
			this.run = function(){
				Prompter.$body.addEventListener('newSecond', that.timeLeft);
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
					Prompter.$body.removeEventListener('newSecond', that.timeLeft);
					that.emit('timeOver', customDetail());
				}
			}
			break
	}
	this.cancel = function(){
		Prompter.$body.removeEventListener('newSecond', that.timeLeft);
		that.emit('timerCancelled', customDetail());
	}
	this.emit('timerStarted', customDetail());
	Prompter.$body.addEventListener('newSecond', that.timeLeft);
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
var parseInput = require('./parseInput');
var toStr = require('./convertTimeFromSecondsToString.js');
var fontSize = require("./fontSize.js");
var fontColor = require("./fontColor.js");
var cutContentToFitDiv = require("./cutContentToFitDiv.js")

var View = function () {
	var that = this;
	this._prompterWindow = undefined;
	this._$timeOnPrompter = null;
	this._$messageOnPrompter = null;
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
	    if (that._$messageOnPrompter) {
	        that._showMessage();
	    } else {
	    	that._openPrompterWindow();
	    	Prompter.$showMessage.textContent = "Нет окна суфлера";
	    }
	}
	this._showMessage = function () {
	        that._$messageOnPrompter.textContent = Prompter.$showMessage.textContent = Prompter.$inputMessage.value;
	        Prompter.$inputMessage.value = "";
	        cutContentToFitDiv(that._$messageOnPrompter);
	}
	this._cutContentToFitDivFunc = function(){
		cutContentToFitDiv(that._$messageOnPrompter);	
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
	        that._$messageOnPrompter = that._prompterWindow.document.querySelector("div#message_show");
	        that._$prompterWindowButtonOnOff.innerHTML = "Закрыть<br>второе<br>окно";
	        that._showMessage();
		    window.addEventListener('unload', that._prompterWindowCloseFunc);
	        that._prompterWindow.addEventListener('unload', that._closePrompterWindow);
	        that._prompterWindow.addEventListener('resize', that._cutContentToFitDivFunc);
	    });
	}
	this._closePrompterWindow = function() {
	    window.removeEventListener('unload', that._prompterWindowCloseFunc);
	    that._prompterWindow.removeEventListener('unload', that._closePrompterWindow);
	    that._prompterWindow.removeEventListener('resize', that._showMessage);
	    that._prompterWindow.close();
		that._prompterWindow = undefined;
		that._$timeOnPrompter = null;
		that._$messageOnPrompter = null;
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
},{"./convertTimeFromSecondsToString.js":2,"./cutContentToFitDiv.js":3,"./fontColor.js":5,"./fontSize.js":6,"./parseInput":9}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb250cm9sbGVyLmpzIiwianMvY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzIiwianMvY3V0Q29udGVudFRvRml0RGl2LmpzIiwianMvZW1pdEV2ZW50LmpzIiwianMvZm9udENvbG9yLmpzIiwianMvZm9udFNpemUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kZWwuanMiLCJqcy9wYXJzZUlucHV0LmpzIiwianMvc2Vjb25kc0V2ZW50RW1pdHRlci5qcyIsImpzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBUaW1lciA9IHJlcXVpcmUoJy4vbW9kZWwuanMnKTtcclxudmFyIHBhcnNlSW5wdXQgPSByZXF1aXJlKCcuL3BhcnNlSW5wdXQuanMnKTtcclxuXHJcbnZhciBDb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHR0aGlzLl90aW1lciA9IG51bGw7XHJcblx0dGhpcy5fYnV0dG9uQ2xpY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0XHR2YXIgaW5wdXQgPSBwYXJzZUlucHV0KCk7XHJcblx0XHRpZighaW5wdXQuaXNWYWxpZCkgdGhyb3cgXCJXcm9uZyBpbnB1dC5cIjtcclxuXHRcdHN3aXRjaCAoZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQpIHtcclxuXHRcdFx0Y2FzZSBQcm9tcHRlci4kYnV0dG9uQ291bnRVcCA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiY291bnRVcFwiLCBpbnB1dC52YWx1ZSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGF0Ll90aW1lci50eXBlID09PSBcImNvdW50VXBcIiAmJiAhdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5wYXVzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudFVwXCIgJiYgdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5ydW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBQcm9tcHRlci4kYnV0dG9uQ291bnREb3duIDpcclxuXHRcdFx0XHRpZighdGhhdC5fdGltZXIpe1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIgPSBuZXcgVGltZXIoXCJjb3VudERvd25cIiwgaW5wdXQudmFsdWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudERvd25cIiAmJiAhdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5wYXVzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudERvd25cIiAmJiB0aGF0Ll90aW1lci5wYXVzZWQpIHtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyLnJ1bigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFByb21wdGVyLiRidXR0b25Db3VudERlYWRsaW5lIDpcclxuXHRcdFx0XHRpZighdGhhdC5fdGltZXIpe1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIgPSBuZXcgVGltZXIoXCJkZWFkbGluZVwiLCBpbnB1dC52YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgUHJvbXB0ZXIuJGJ1dHRvblJlc2V0IDpcclxuXHRcdFx0XHRpZiAodGhhdC5fdGltZXIpIHRoYXQuX3RpbWVyLmNhbmNlbCgpO1xyXG5cdFx0XHRcdHRoYXQuX3RpbWVyID0gbnVsbDtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cdH1cclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhhdC5fYnV0dG9uQ2xpY2tQcm9jZXNzaW5nKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpbWVJblNlY29uZHMsIGZ1bGxGb3JtYXQpIHtcclxuICAgIHZhciBoID0gTWF0aC5mbG9vcih0aW1lSW5TZWNvbmRzIC8gKDM2MDApKTtcclxuICAgIHZhciBtID0gTWF0aC5mbG9vcigodGltZUluU2Vjb25kcyAtIGggKiAzNjAwKSAvIDYwKTtcclxuICAgIHZhciBzID0gTWF0aC5mbG9vcih0aW1lSW5TZWNvbmRzIC0gaCAqIDM2MDAgLSBtICogNjApO1xyXG4gICAgdmFyIHRpbWVTdHJpbmcgPSBcIjpcIiArIChzIDwgMTAgPyBcIjBcIiArIHMgOiBzKTtcclxuICAgIGlmKGZ1bGxGb3JtYXQpe1xyXG4gICAgICAgIHRpbWVTdHJpbmcgPSAoaCA8IDEwID8gXCIwXCIgKyBoIDogaCkgKyBcIjpcIiArIChtIDwgMTAgPyBcIjBcIiArIG0gOiBtKSArIHRpbWVTdHJpbmc7XHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgICAgaWYgKGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSBoICsgXCI6XCIgKyAobSA8IDEwID8gXCIwXCIgKyBtIDogbSkgKyB0aW1lU3RyaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSBtICsgdGltZVN0cmluZztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGltZVN0cmluZztcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkbWVzc2FnZURpdlNlY29uZERpc3BsKSB7XHJcblx0dmFyIHRlbXAgPSAkbWVzc2FnZURpdlNlY29uZERpc3BsLnRleHRDb250ZW50O1xyXG5cdCRtZXNzYWdlRGl2U2Vjb25kRGlzcGwudGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cdHZhciBzY3JvbGxIZWlnaHQsXHJcblx0XHR0b2dnbGUgPSB0cnVlO1xyXG5cdHZhciBpZCA9IHNldEludGVydmFsKGN1dENvbnRlbnRUb0ZpdERpdiwgNCk7XHJcblx0ZnVuY3Rpb24gY3V0Q29udGVudFRvRml0RGl2KCkge1xyXG5cdFx0aWYgKCFzY3JvbGxIZWlnaHQpIHNjcm9sbEhlaWdodCA9ICRtZXNzYWdlRGl2U2Vjb25kRGlzcGwuc2Nyb2xsSGVpZ2h0O1xyXG5cdFx0aWYodG9nZ2xlKXtcclxuXHRcdFx0JG1lc3NhZ2VEaXZTZWNvbmREaXNwbC50ZXh0Q29udGVudCA9IHRlbXA7XHJcblx0XHRcdHRvZ2dsZSA9IGZhbHNlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYoJG1lc3NhZ2VEaXZTZWNvbmREaXNwbC5zY3JvbGxIZWlnaHQgPiBzY3JvbGxIZWlnaHQpe1xyXG5cdFx0XHRcdHRlbXAgPSAkbWVzc2FnZURpdlNlY29uZERpc3BsLnRleHRDb250ZW50LnNsaWNlKDAsIC0xKTtcclxuXHRcdFx0XHR0b2dnbGUgPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoaWQpO1xyXG5cdFx0XHRcdFByb21wdGVyLiRzaG93TWVzc2FnZS50ZXh0Q29udGVudCA9IHRlbXA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGN1c3RvbUV2ZW50SW5pdCkge1xyXG4gICAgdmFyIGV2bnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCBjdXN0b21FdmVudEluaXQpO1xyXG4gICAgUHJvbXB0ZXIuJGJvZHkuZGlzcGF0Y2hFdmVudChldm50KTtcclxufSIsInZhciBwYXJzZUlucHV0ID0gcmVxdWlyZSgnLi9wYXJzZUlucHV0LmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdHZhciBmb250Q29sb3IgPSBcIlwiO1xyXG5cdHZhciB0aW1lTGVmdFNlY29uZHMgPSBJbmZpbml0eTtcclxuXHRzd2l0Y2ggKGV2ZW50LmRldGFpbC50eXBlKXtcclxuXHRcdGNhc2UgXCJjb3VudFVwXCI6XHJcblx0XHRcdGlmKGV2ZW50LmRldGFpbC5kZWFkbGluZSAhPT0gXCIwOjAwXCIpe1xyXG5cdFx0XHRcdHRpbWVMZWZ0U2Vjb25kcyA9IHBhcnNlSW5wdXQoZXZlbnQuZGV0YWlsLmRlYWRsaW5lKS52YWx1ZSAtIHBhcnNlSW5wdXQoZXZlbnQuZGV0YWlsLnRpbWUpLnZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiY291bnREb3duXCI6XHJcblx0XHRcdHRpbWVMZWZ0U2Vjb25kcyA9IHBhcnNlSW5wdXQoZXZlbnQuZGV0YWlsLnRpbWUpLnZhbHVlO1xyXG5cdFx0XHRicmVha1xyXG5cdFx0Y2FzZSBcImRlYWRsaW5lXCI6XHJcblx0XHRcdHRpbWVMZWZ0U2Vjb25kcyA9IHBhcnNlSW5wdXQoZXZlbnQuZGV0YWlsLnRpbWUpLnZhbHVlO1xyXG5cdFx0XHRicmVha1xyXG5cdH1cclxuXHRpZih0aW1lTGVmdFNlY29uZHMgPiAxMjApe1xyXG5cdFx0Zm9udENvbG9yID0gXCJcIjtcclxuXHR9IGVsc2UgaWYgKHRpbWVMZWZ0U2Vjb25kcyA+IDYwKSB7XHJcblx0XHRmb250Q29sb3IgPSBcIm9yYW5nZVwiO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRmb250Q29sb3IgPSBcInJlZFwiO1xyXG5cdH1cclxuXHRyZXR1cm4gZm9udENvbG9yO1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICB2YXIgZm9udFNpemUgPSB1bmRlZmluZWQ7XHJcbiAgICB2YXIgbWluRm9udFNpemUgPSAyMztcclxuICAgIHZhciBtYXhGb250U2l6ZSA9IDQwO1xyXG4gICAgdmFyIG1pblN0cmluZ0xlbmd0aCA9IDQ7XHJcbiAgICB2YXIgbWF4U3RyaW5nTGVuZ3RoID0gODtcclxuICAgIGZvbnRTaXplID0gTWF0aC5mbG9vcihtaW5Gb250U2l6ZSBcclxuICAgIFx0KyAobWF4U3RyaW5nTGVuZ3RoIC0gZXZlbnQuZGV0YWlsLnRpbWUubGVuZ3RoKSAqIChtYXhGb250U2l6ZSAtIG1pbkZvbnRTaXplKSAvIChtYXhTdHJpbmdMZW5ndGggLSBtaW5TdHJpbmdMZW5ndGgpKTtcclxuXHRyZXR1cm4gZm9udFNpemU7XHJcbn0iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciBDb250cm9sbGVyID0gcmVxdWlyZSgnLi9jb250cm9sbGVyLmpzJyk7XHJcblx0dmFyIFZpZXcgPSByZXF1aXJlKFwiLi92aWV3LmpzXCIpO1xyXG4gICAgd2luZG93LlByb21wdGVyID0ge1xyXG4gICAgICAgICRib2R5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKSxcclxuICAgICAgICAkYnV0dG9uQ291bnRVcDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiN1cFwiKSxcclxuICAgICAgICAkYnV0dG9uQ291bnREb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2Rvd25cIiksXHJcbiAgICAgICAgJGlucHV0QW5kRGlzcGxheVRpbWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dCN0aW1lXCIpLFxyXG4gICAgICAgICRidXR0b25Db3VudERlYWRsaW5lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2RlYWRsaW5lX3N0YXJ0XCIpLFxyXG4gICAgICAgICRidXR0b25SZXNldDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNyZXNldFwiKSxcclxuICAgICAgICAkaW5wdXRNZXNzYWdlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidGV4dGFyZWEjbWVzc2FnZVwiKSxcclxuICAgICAgICAkc2hvd1RpbWVMZWZ0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3RpbWVfbGVmdFwiKSxcclxuICAgICAgICAkc2hvd01lc3NhZ2U6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjbWVzc2FnZV9zaG93XCIpXHJcbiAgICB9XHJcbiAgICByZXF1aXJlKCcuL3NlY29uZHNFdmVudEVtaXR0ZXIuanMnKTtcclxuICAgIHZhciBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTtcclxuICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoKTtcclxufSIsInZhciBjb252ZXJ0VG9TdHJpbmcgPSByZXF1aXJlKFwiLi9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanNcIik7XG52YXIgZW1pdCA9IHJlcXVpcmUoXCIuL2VtaXRFdmVudFwiKTtcblxudmFyIFRpbWVyID0gZnVuY3Rpb24gKHR5cGVPZlRpbWVyLCBlbnRlcmVkVGltZUluU2Vjb25kcykge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuZW1pdCA9IGVtaXQ7XG5cdHRoaXMudHlwZSA9IHR5cGVPZlRpbWVyO1xuXHRzd2l0Y2ggKHR5cGVPZlRpbWVyKXtcblx0XHRjYXNlIFwiY291bnRVcFwiOlxuXHRcdFx0dGhpcy50aW1lclZhbHVlID0gMDtcblx0XHRcdHRoaXMuZGVhZGxpbmUgPSBlbnRlcmVkVGltZUluU2Vjb25kcztcblx0XHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKXtcblx0XHRcdFx0dGhhdC50aW1lclZhbHVlKys7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJDaGFuZ2VkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0XHRpZih0aGF0LnRpbWVyVmFsdWUgPT09IHRoYXQuZGVhZGxpbmUgJiYgdGhhdC5kZWFkbGluZSkge1xuXHRcdFx0XHRcdHRoYXQucGF1c2UoKTtcblx0XHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVPdmVyJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBhdXNlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclBhdXNlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gZmFsc2U7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJSdW4nLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgXCJjb3VudERvd25cIjpcblx0XHRcdHRoaXMudGltZXJWYWx1ZSA9IGVudGVyZWRUaW1lSW5TZWNvbmRzO1xuXHRcdFx0dGhpcy5kZWFkbGluZSA9IDA7XG5cdFx0XHR0aGlzLnRpbWVMZWZ0ID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZS0tO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0aWYodGhhdC50aW1lclZhbHVlID09PSAwKSB7XG5cdFx0XHRcdFx0dGhhdC5wYXVzZSgpO1xuXHRcdFx0XHRcdHRoYXQuZW1pdCgndGltZU92ZXInLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucGF1c2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRQcm9tcHRlci4kYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUGF1c2VkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclJ1bicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBcImRlYWRsaW5lXCI6XG5cdFx0XHR2YXIgZW50ZXJlZFRpbWUgPSBjb252ZXJ0VG9TdHJpbmcoZW50ZXJlZFRpbWVJblNlY29uZHMsIHRydWUpO1xuXHRcdFx0dGhpcy5kZWFkbGluZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lLnNldEhvdXJzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoMCwgMikpO1xuXHRcdFx0dGhpcy5kZWFkbGluZS5zZXRNaW51dGVzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoMywgNSkpO1xuXHRcdFx0dGhpcy5kZWFkbGluZS5zZXRTZWNvbmRzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoNikpO1xuXHRcdFx0aWYgKHRoaXMuZGVhZGxpbmUgPCBuZXcgRGF0ZSgpKSB7XG5cdFx0XHRcdHRoaXMuZGVhZGxpbmUuc2V0RGF0ZSh0aGlzLmRlYWRsaW5lLmdldERhdGUoKSArIDEpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5kZWFkbGluZS5mcm9tRGF0ZVRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAodGhhdC5kZWFkbGluZS5nZXRIb3VycygpICsgJzonICsgdGhhdC5kZWFkbGluZS5nZXRNaW51dGVzKCkgKyAnOicgKyB0aGF0LmRlYWRsaW5lLmdldFNlY29uZHMoKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUgPSBNYXRoLmZsb29yKCh0aGlzLmRlYWRsaW5lIC0gbmV3IERhdGUoKSkgLyAxMDAwKTtcblx0XHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZSA9IE1hdGguZmxvb3IoKHRoYXQuZGVhZGxpbmUgLSBuZXcgRGF0ZSgpKSAvIDEwMDApO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0aWYgKHRoYXQudGltZXJWYWx1ZSA9PT0gMCl7XG5cdFx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lT3ZlcicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0fVxuXHR0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uKCl7XG5cdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0dGhhdC5lbWl0KCd0aW1lckNhbmNlbGxlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0fVxuXHR0aGlzLmVtaXQoJ3RpbWVyU3RhcnRlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdGZ1bmN0aW9uIGN1c3RvbURldGFpbCgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGV0YWlsOiB7XG5cdFx0XHRcdHR5cGU6IHR5cGVPZlRpbWVyLFxuXHRcdFx0XHR0aW1lOiBjb252ZXJ0VG9TdHJpbmcodGhhdC50aW1lclZhbHVlKSxcblx0XHRcdFx0ZGVhZGxpbmU6ICh0eXBlT2ZUaW1lciA9PT0gXCJkZWFkbGluZVwiKSA/IHRoYXQuZGVhZGxpbmUuZnJvbURhdGVUb1N0cmluZygpIDogY29udmVydFRvU3RyaW5nKHRoYXQuZGVhZGxpbmUpXG5cdFx0XHR9XG5cdFx0fVx0XG5cdH0gXG5cdHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpbWVTdHJpbmcpIHtcclxuICAgIGlmKCF0aW1lU3RyaW5nKXtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID8gUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgOiAwKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IE5hTixcclxuICAgICAgICBpc1ZhbGlkOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKHRpbWVTdHJpbmcpKSB7XHJcbiAgICAgICAgdmFyIHZhbGlkQ2hhcnMgPSBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgXCI6XCJdO1xyXG4gICAgICAgIHZhciB0aW1lTnVtYmVyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbWVTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlzQ2hhclZhbGlkID0gdmFsaWRDaGFycy5zb21lKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZVN0cmluZ1tpXSA9PSBpdGVtO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpZiAoIWlzQ2hhclZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcItCU0L7Qv9GD0YHRgtC40LzQviDQstCy0L7QtNC40YLRjCDRgtC+0LvRjNC60L4g0YbQuNGE0YDRiyDQuCDQtNCy0L7QtdGC0L7Rh9C40Y8uXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aW1lU3RyaW5nW2ldICE9PSBcIjpcIikgdGltZU51bWJlciA9IHRpbWVOdW1iZXIgKiAxMCArICgrdGltZVN0cmluZ1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHRpbWVOdW1iZXIgPSB0aW1lU3RyaW5nO1xyXG5cclxuICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZU51bWJlciAvIDEwMDAwKTtcclxuICAgIGlmIChob3VycyA+IDIzKSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfRh9Cw0YHQvtCyJyDQsdC+0LvRjNGI0LUgMjMuXCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigodGltZU51bWJlciAtIGhvdXJzICogMTAwMDApIC8gMTAwKTtcclxuICAgIGlmIChtaW51dGVzID4gNTkpIHtcclxuICAgICAgICBhbGVydChcItCX0L3QsNGH0LXQvdC40LUgJ9C80LjQvdGD0YInINCx0L7Qu9GM0YjQtSA1OS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKHRpbWVOdW1iZXIgLSBob3VycyAqIDEwMDAwIC0gbWludXRlcyAqIDEwMCk7XHJcbiAgICBpZiAoc2Vjb25kcyA+IDU5KSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfRgdC10LrRg9C90LQnINCx0L7Qu9GM0YjQtSA1OS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIHRpbWVJblNlY29uZHMgPSBob3VycyAqIDM2MDAgKyBtaW51dGVzICogNjAgKyBzZWNvbmRzO1xyXG4gICAgcmV0dXJuIHJlc3VsdCA9IHtcclxuICAgICAgICB2YWx1ZTogdGltZUluU2Vjb25kcyxcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9XHJcbn1cclxuIiwidmFyIGVtaXQgPSByZXF1aXJlKCcuL2VtaXRFdmVudCcpO1xyXG52YXIgY3VycmVudFRpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxudmFyIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbChlbWl0RXZlbnRFdmVyeVNlY29uZCwgMTAwKTtcclxuXHJcbmZ1bmN0aW9uIGVtaXRFdmVudEV2ZXJ5U2Vjb25kKCkge1xyXG4gICAgdmFyIG5ld1RpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIGlmIChjdXJyZW50VGltZUluU2Vjb25kcyAhPT0gbmV3VGltZUluU2Vjb25kcykge1xyXG4gICAgICAgIGN1cnJlbnRUaW1lSW5TZWNvbmRzID0gbmV3VGltZUluU2Vjb25kcztcclxuICAgICAgICBlbWl0KCduZXdTZWNvbmQnKTtcclxuICAgIH1cclxufVxyXG5cclxuIiwidmFyIHBhcnNlSW5wdXQgPSByZXF1aXJlKCcuL3BhcnNlSW5wdXQnKTtcclxudmFyIHRvU3RyID0gcmVxdWlyZSgnLi9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanMnKTtcclxudmFyIGZvbnRTaXplID0gcmVxdWlyZShcIi4vZm9udFNpemUuanNcIik7XHJcbnZhciBmb250Q29sb3IgPSByZXF1aXJlKFwiLi9mb250Q29sb3IuanNcIik7XHJcbnZhciBjdXRDb250ZW50VG9GaXREaXYgPSByZXF1aXJlKFwiLi9jdXRDb250ZW50VG9GaXREaXYuanNcIilcclxuXHJcbnZhciBWaWV3ID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHR0aGlzLl9wcm9tcHRlcldpbmRvdyA9IHVuZGVmaW5lZDtcclxuXHR0aGlzLl8kdGltZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cdHRoaXMuXyRtZXNzYWdlT25Qcm9tcHRlciA9IG51bGw7XHJcblx0dGhpcy5fJHByb21wdGVyV2luZG93QnV0dG9uT25PZmYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI3NjcmVlbjJcIik7XHJcblx0UHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gXCLQndC10YIg0L7QutC90LAg0YHRg9GE0LvQtdGA0LBcIjtcclxuXHJcblx0dGhpcy5fcHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHQgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcblx0ICAgICAgICB0aGF0Ll9wcm9jZXNzTWVzc2FnZSgpO1xyXG5cdCAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHQgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAyNykge1xyXG5cdCAgICAgICAgUHJvbXB0ZXIuJGlucHV0TWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XHJcblx0ICAgIH1cclxuXHR9XHJcblx0dGhpcy5fcHJvY2Vzc01lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll8kbWVzc2FnZU9uUHJvbXB0ZXIpIHtcclxuXHQgICAgICAgIHRoYXQuX3Nob3dNZXNzYWdlKCk7XHJcblx0ICAgIH0gZWxzZSB7XHJcblx0ICAgIFx0dGhhdC5fb3BlblByb21wdGVyV2luZG93KCk7XHJcblx0ICAgIFx0UHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gXCLQndC10YIg0L7QutC90LAg0YHRg9GE0LvQtdGA0LBcIjtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9zaG93TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuXHQgICAgICAgIHRoYXQuXyRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudCA9IFByb21wdGVyLiRzaG93TWVzc2FnZS50ZXh0Q29udGVudCA9IFByb21wdGVyLiRpbnB1dE1lc3NhZ2UudmFsdWU7XHJcblx0ICAgICAgICBQcm9tcHRlci4kaW5wdXRNZXNzYWdlLnZhbHVlID0gXCJcIjtcclxuXHQgICAgICAgIGN1dENvbnRlbnRUb0ZpdERpdih0aGF0Ll8kbWVzc2FnZU9uUHJvbXB0ZXIpO1xyXG5cdH1cclxuXHR0aGlzLl9jdXRDb250ZW50VG9GaXREaXZGdW5jID0gZnVuY3Rpb24oKXtcclxuXHRcdGN1dENvbnRlbnRUb0ZpdERpdih0aGF0Ll8kbWVzc2FnZU9uUHJvbXB0ZXIpO1x0XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyU3RhcnRlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRzd2l0Y2ggKGV2ZW50LmRldGFpbC50eXBlKSB7XHJcblx0XHRcdGNhc2UgXCJjb3VudFVwXCI6XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgPSBldmVudC5kZXRhaWwuZGVhZGxpbmU7XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCIjMGYwXCI7XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuaW5uZXJIVE1MID0gXCLQn9GA0Y/QvNC+0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0LDRg9C30LBcIjtcclxuXHRcdFx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJjb3VudERvd25cIjpcclxuXHRcdFx0XHRQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA9IGV2ZW50LmRldGFpbC50aW1lO1xyXG5cdFx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERvd24uc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCIjMGYwXCI7XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93bi5pbm5lckhUTUwgPSBcItCe0LHRgNCw0YLQvdGL0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0LDRg9C30LBcIjtcclxuXHRcdFx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJkZWFkbGluZVwiOlxyXG5cdFx0XHRcdFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID0gZXZlbnQuZGV0YWlsLmRlYWRsaW5lO1xyXG5cdFx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERlYWRsaW5lLnN0eWxlW1wiYmFja2dyb3VuZC1jb2xvclwiXSA9IFwiIzBmMFwiO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyUGF1c2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuX3Nob3dUaW1lT25Qcm9tcHRlcihldmVudClcclxuXHRcdHN3aXRjaCAoZXZlbnQuZGV0YWlsLnR5cGUpIHtcclxuXHRcdGNhc2UgXCJjb3VudFVwXCI6XHJcblx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudFVwLmlubmVySFRNTCA9IFwi0J/RgNGP0LzQvtC5INC+0YLRgdGH0LXRgjxicj7Qv9GD0YHQulwiO1xyXG5cdFx0XHRicmVha1xyXG5cdFx0Y2FzZSBcImNvdW50RG93blwiOlxyXG5cdFx0XHRQcm9tcHRlci4kYnV0dG9uQ291bnREb3duLmlubmVySFRNTCA9IFwi0J7QsdGA0LDRgtC90YvQuSDQvtGC0YHRh9C10YI8YnI+0L/Rg9GB0LpcIjtcclxuXHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5fdGltZXJSdW4gPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fc2hvd1RpbWVPblByb21wdGVyKGV2ZW50KVxyXG5cdFx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSkge1xyXG5cdFx0Y2FzZSBcImNvdW50VXBcIjpcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuaW5uZXJIVE1MID0gXCLQn9GA0Y/QvNC+0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0LDRg9C30LBcIjtcclxuXHRcdFx0YnJlYWtcclxuXHRcdGNhc2UgXCJjb3VudERvd25cIjpcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93bi5pbm5lckhUTUwgPSBcItCe0LHRgNCw0YLQvdGL0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0LDRg9C30LBcIjtcclxuXHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5fdGltZXJDYW5jZWxsZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fJHRpbWVPblByb21wdGVyLnRleHRDb250ZW50ID0gUHJvbXB0ZXIuJHNob3dUaW1lTGVmdC50ZXh0Q29udGVudCA9IFwiXCI7XHJcblx0XHR0aGF0Ll8kdGltZU9uUHJvbXB0ZXIuc3R5bGUuY29sb3IgPSBQcm9tcHRlci4kc2hvd1RpbWVMZWZ0LnN0eWxlLmNvbG9yID0gXCJcIjtcdFxyXG5cdCAgICBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA9IFwiXCI7XHJcblx0ICAgIFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnN0eWxlW1wiYmFja2dyb3VuZC1jb2xvclwiXSA9IFwiXCI7XHJcblx0XHRzd2l0Y2ggKGV2ZW50LmRldGFpbC50eXBlKSB7XHJcblx0XHRcdGNhc2UgXCJjb3VudFVwXCI6XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCJcIjtcclxuXHRcdFx0XHRQcm9tcHRlci4kYnV0dG9uQ291bnRVcC5pbm5lckhUTUwgPSBcItCf0YDRj9C80L7QuSDQvtGC0YHRh9C10YI8YnI+0L/Rg9GB0LpcIjtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiY291bnREb3duXCI6XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93bi5zdHlsZVtcImJhY2tncm91bmQtY29sb3JcIl0gPSBcIlwiO1xyXG5cdFx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERvd24uaW5uZXJIVE1MID0gXCLQntCx0YDQsNGC0L3Ri9C5INC+0YLRgdGH0LXRgjxicj7Qv9GD0YHQulwiO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJkZWFkbGluZVwiOlxyXG5cdFx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERlYWRsaW5lLnN0eWxlW1wiYmFja2dyb3VuZC1jb2xvclwiXSA9IFwiXCI7XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5fdGltZU92ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fc2hvd1RpbWVPblByb21wdGVyKGV2ZW50KVxyXG5cdCAgICBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS5zdHlsZVtcImJhY2tncm91bmQtY29sb3JcIl0gPSBcIiNmMDBcIjtcclxuXHR9XHJcblx0dGhpcy5fb3BlblByb21wdGVyV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0ICAgIHZhciBzdHJXaW5kb3dGZWF0dXJlcyA9IFwibWVudWJhcj1ubywgbG9jYXRpb249bm8sIGxvY2F0aW9uYmFyPW5vLCB0b29sYmFyPW5vLCBwZXJzb25hbGJhcj1ubywgc3RhdHVzPW5vLCByZXNpemFibGU9eWVzLCBzY3JvbGxiYXJzPW5vLHN0YXR1cz1ub1wiO1xyXG5cdCAgICB2YXIgc3RyV2luZG93UG9zaXRpb25BbmRTaXplID0gXCJoZWlnaHQ9MzAwLHdpZHRoPTUwMFwiO1xyXG5cdCAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdyA9IHdpbmRvdy5vcGVuKFwicHJvbXB0ZXIuaHRtbFwiLCBcInByb21wdGVyXCIsIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSArIFwiLFwiICsgc3RyV2luZG93RmVhdHVyZXMpO1xyXG5cdCAgICBpZighdGhhdC5fcHJvbXB0ZXJXaW5kb3cpIHJldHVybjtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuXHQgICAgICAgIHRoYXQuXyR0aW1lT25Qcm9tcHRlciA9IHRoYXQuX3Byb21wdGVyV2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjdGltZV9sZWZ0XCIpO1xyXG5cdCAgICAgICAgdGhhdC5fJG1lc3NhZ2VPblByb21wdGVyID0gdGhhdC5fcHJvbXB0ZXJXaW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIik7XHJcblx0ICAgICAgICB0aGF0Ll8kcHJvbXB0ZXJXaW5kb3dCdXR0b25Pbk9mZi5pbm5lckhUTUwgPSBcItCX0LDQutGA0YvRgtGMPGJyPtCy0YLQvtGA0L7QtTxicj7QvtC60L3QvlwiO1xyXG5cdCAgICAgICAgdGhhdC5fc2hvd01lc3NhZ2UoKTtcclxuXHRcdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fcHJvbXB0ZXJXaW5kb3dDbG9zZUZ1bmMpO1xyXG5cdCAgICAgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdyk7XHJcblx0ICAgICAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGF0Ll9jdXRDb250ZW50VG9GaXREaXZGdW5jKTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdHRoaXMuX2Nsb3NlUHJvbXB0ZXJXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHQgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHRoYXQuX3Byb21wdGVyV2luZG93Q2xvc2VGdW5jKTtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdyk7XHJcblx0ICAgIHRoYXQuX3Byb21wdGVyV2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoYXQuX3Nob3dNZXNzYWdlKTtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuY2xvc2UoKTtcclxuXHRcdHRoYXQuX3Byb21wdGVyV2luZG93ID0gdW5kZWZpbmVkO1xyXG5cdFx0dGhhdC5fJHRpbWVPblByb21wdGVyID0gbnVsbDtcclxuXHRcdHRoYXQuXyRtZXNzYWdlT25Qcm9tcHRlciA9IG51bGw7XHJcbiAgICBcdHRoYXQuXyRwcm9tcHRlcldpbmRvd0J1dHRvbk9uT2ZmLmlubmVySFRNTCA9IFwi0KHQvtC30LTQsNGC0Yw8YnI+0LLRgtC+0YDQvtC1PGJyPtC+0LrQvdC+XCI7XHJcbiAgICBcdFByb21wdGVyLiRzaG93TWVzc2FnZS50ZXh0Q29udGVudCA9IFwi0J3QtdGCINC+0LrQvdCwINGB0YPRhNC70LXRgNCwXCI7XHJcblx0fVxyXG5cdHRoaXMuX3Byb21wdGVyV2luZG93T25PZmYgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll9wcm9tcHRlcldpbmRvdykgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdygpO1xyXG5cdCAgICBlbHNlIHRoYXQuX29wZW5Qcm9tcHRlcldpbmRvdygpO1xyXG5cdH1cclxuXHR0aGlzLl9wcm9tcHRlcldpbmRvd0Nsb3NlRnVuYyA9IGZ1bmN0aW9uICgpIHtcclxuXHQgICAgaWYgKHRoYXQuX3Byb21wdGVyV2luZG93KSB0aGF0Ll9jbG9zZVByb21wdGVyV2luZG93KCk7XHJcblx0fVxyXG5cdHRoaXMuX3Nob3dUaW1lT25Qcm9tcHRlciA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGlmICh0aGF0Ll8kdGltZU9uUHJvbXB0ZXIpIHtcclxuICAgICAgICAgICAgdGhhdC5fJHRpbWVPblByb21wdGVyLnN0eWxlWydmb250LXNpemUnXSA9IGZvbnRTaXplKGV2ZW50KSArICd2dyc7XHJcblx0XHRcdHRoYXQuXyR0aW1lT25Qcm9tcHRlci5zdHlsZS5jb2xvciA9IFByb21wdGVyLiRzaG93VGltZUxlZnQuc3R5bGUuY29sb3IgPSBmb250Q29sb3IoZXZlbnQpO1xyXG5cdFx0XHR0aGF0Ll8kdGltZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQgPSBQcm9tcHRlci4kc2hvd1RpbWVMZWZ0LnRleHRDb250ZW50ID0gZXZlbnQuZGV0YWlsLnRpbWU7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0UHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gXCLQndC10YIg0L7QutC90LAg0YHRg9GE0LvQtdGA0LBcIjtcclxuXHRcdFx0dGhhdC5fb3BlblByb21wdGVyV2luZG93KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIHZhciBpbnB1dCA9IHBhcnNlSW5wdXQoKTtcclxuXHQgICAgaWYgKGlucHV0LmlzVmFsaWQpIFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID0gdG9TdHIoaW5wdXQudmFsdWUpO1xyXG5cdH0pO1xyXG5cdHRoaXMuXyRwcm9tcHRlcldpbmRvd0J1dHRvbk9uT2ZmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhhdC5fcHJvbXB0ZXJXaW5kb3dPbk9mZik7XHJcblx0UHJvbXB0ZXIuJGlucHV0TWVzc2FnZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGF0Ll9wcm9jZXNzS2V5RG93bik7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJTdGFydGVkJywgdGhhdC5fdGltZXJTdGFydGVkKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lckNoYW5nZWQnLCB0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyUGF1c2VkJywgdGhhdC5fdGltZXJQYXVzZWQpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyUnVuJywgdGhhdC5fdGltZXJSdW4pO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyQ2FuY2VsbGVkJywgdGhhdC5fdGltZXJDYW5jZWxsZWQpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVPdmVyJywgdGhhdC5fdGltZU92ZXIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
