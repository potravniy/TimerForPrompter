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
					that._timer = new Timer("count-up", input.value);
				} else if (that._timer.type === "count-up" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "count-up" && that._timer.paused) {
					that._timer.run();
				}
				break
			case window.Prompter.$buttonCountDown :
				if(!that._timer){
					that._timer = new Timer("count-down", input.value);
				} else if (that._timer.type === "count-down" && !that._timer.paused) {
					that._timer.pause();
				} else if (that._timer.type === "count-down" && that._timer.paused) {
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
},{"./model.js":7,"./parseInput.js":8}],2:[function(require,module,exports){
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
	var temp = window.Prompter.View.$messageOnPrompter.textContent;
	window.Prompter.View.$messageOnPrompter.textContent = "";
	var scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if (!scrollHeight) scrollHeight = window.Prompter.View.$messageOnPrompter.scrollHeight;
		if(toggle){
			window.Prompter.View.$messageOnPrompter.textContent = temp;
			toggle = false;
		} else {
			if(window.Prompter.View.$messageOnPrompter.scrollHeight > scrollHeight){
				temp = window.Prompter.View.$messageOnPrompter.textContent.slice(0, -1);
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
		case "count-up":
			if(event.detail.deadline !== "0:00"){
				timeLeftSeconds = parseInput(event.detail.deadline).value
					- parseInput(event.detail.time).value;
			}
			break
		case "count-down":
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
    var fontSize = undefined;
    var minFontSize = 23;
    var maxFontSize = 40;
    var minStringLength = 4;
    var maxStringLength = 8;
    fontSize = Math.floor(minFontSize 
    	+ (maxStringLength - event.detail.time.length)
        * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));

	return {
		color: fontColor,
		size: fontSize + 'vw'
	}
}

},{"./parseInput.js":8}],6:[function(require,module,exports){
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
},{"./controller.js":1,"./secondsEventEmitter.js":9,"./view.js":10}],7:[function(require,module,exports){
var convertToString = require("./convertTimeFromSecondsToString.js");
var emit = require("./emitEvent");

var Timer = function (typeOfTimer, enteredTimeInSeconds) {
	var that = this;
	this.emit = emit;
	this.type = typeOfTimer;
	switch (typeOfTimer){
		case "count-up":
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
		case "count-down":
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
},{"./convertTimeFromSecondsToString.js":2,"./emitEvent":4}],8:[function(require,module,exports){
/* global Prompter */
module.exports = function (timeString) {
    if (!timeString) {
        timeString = (Prompter.$inputAndDisplayTime.value
            ? Prompter.$inputAndDisplayTime.value : 0);
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
            if (timeString[i] !== ":") {
                timeNumber = timeNumber * 10 + (+timeString[i]);
            }
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

},{}],9:[function(require,module,exports){
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


},{"./emitEvent":4}],10:[function(require,module,exports){
/* global Prompter */
var parseInput = require('./parseInput.js');
var toStr = require('./convertTimeFromSecondsToString.js');
var fontFormat = require("./fontFormat.js");
var cutContentToFit = require("./cutContentToFitDiv.js");

var View = function () {
	var that = this;
	this._state = {
		_prompterState: "prompter-off",
		prompterStateSet: function(str){
			if(str==="prompter-off" || str==="prompter-on") {
				that._state._prompterState = str;
				that._state._send();
			} else throw Error;
		},
		_timerState: "no-timer",
		timerStateSet: function(str){
			if(str==="no-timer" || str==="count-up" || str==="count-up-paused" 
			|| str==="count-up-over" || str==="count-down" || str==="count-down-paused" 
			|| str==="count-down-over" || str==="deadline"  || str==="deadline-over") {
				that._state._timerState = str;
				that._state._send();
			} else throw Error;
		},
		_send: function(){
			Prompter.$body.className = that._state._prompterState + " " 
			+ that._state._timerState;
		}
	}
	that._state._send();
	this._$prompterWindowButtonOnOff = document.querySelector("button#screen2");
	this._prompterWindow = null;
	window.Prompter.View.$timeOnPrompter = null;
	window.Prompter.View.$messageOnPrompter = null;

	this._processKeyDown = function (event) {
	    if (event.keyCode === 13) {
	        that._processMessage();
	        event.preventDefault();
	    } else if (event.keyCode === 27) {
			Prompter.$inputMessage.value = "";
	    }
	}
	this._processMessage = function () {
	    if (that._state._prompterState === "prompter-on") {
	        that._showMessage();
	    } else {
	    	that._openPrompterWindow();
	    }
	}
	this._showMessage = function () {
		window.Prompter.View.$messageOnPrompter.textContent
		= Prompter.$showMessage.textContent = Prompter.$inputMessage.value;
		Prompter.$inputMessage.value = "";
		cutContentToFit();
	}
	this._timerStarted = function(event) {
		that._state.timerStateSet(event.detail.type);
		that._showTimeOnPrompter(event);
		switch (event.detail.type) {
			case "count-up":
			case "deadline":
				Prompter.$inputAndDisplayTime.value = event.detail.deadline;
				break
			case "count-down":
				Prompter.$inputAndDisplayTime.value = event.detail.time;
				break
		}
	}
	this._timerPaused = function(event) {
		that._state.timerStateSet(event.detail.type + "-paused");
		that._showTimeOnPrompter(event)
	}
	this._timerRun = function(event) {
		that._state.timerStateSet(event.detail.type);
		that._showTimeOnPrompter(event)
	}
	this._timerCancelled = function(event) {
		that._state.timerStateSet("no-timer");
		window.Prompter.View.$timeOnPrompter.textContent
			= Prompter.$showTimeLeft.textContent = "";
	    Prompter.$inputAndDisplayTime.value = "";
	}
	this._timeOver = function(event) {
		that._state.timerStateSet(event.detail.type + "-over");
		that._showTimeOnPrompter(event)
	}
	this._openPrompterWindow = function() {
	    var strWindowFeatures = "menubar=no, location=no, locationbar=no";
		strWindowFeatures += "toolbar=no, personalbar=no, status=no";
		strWindowFeatures += "resizable=yes, scrollbars=no,status=no";
	    var strWindowPositionAndSize = "height=300,width=500";
	    that._prompterWindow = window.open("prompter.html", "prompter"
			, strWindowPositionAndSize + "," + strWindowFeatures);
	    if(!that._prompterWindow) return;
	    that._prompterWindow.addEventListener('load', function () {
	        window.Prompter.View.$timeOnPrompter
				= that._prompterWindow.document.querySelector("div#time_left");
	        window.Prompter.View.$messageOnPrompter
				= that._prompterWindow.document.querySelector("div#message_show");
	        that._state.prompterStateSet("prompter-on");
	        that._showMessage();
		    window.addEventListener('unload', that._prompterWindowCloseFunc);
	        that._prompterWindow.addEventListener('unload', that._closePrompterWindow);
	        that._prompterWindow.addEventListener('resize', that.cutContentToFit);
	    });
	}
	this._closePrompterWindow = function() {
	    window.removeEventListener('unload', that._prompterWindowCloseFunc);
	    that._prompterWindow.removeEventListener('unload', that._closePrompterWindow);
	    that._prompterWindow.removeEventListener('resize', that._showMessage);
	    that._prompterWindow.close();
		that._prompterWindow = null;
		window.Prompter.View.$timeOnPrompter = null;
		window.Prompter.View.$messageOnPrompter = null;
		Prompter.$showMessage.textContent = "";
	    that._state.prompterStateSet("prompter-off");
	}
	this._prompterWindowOnOff = function () {
	    if (that._state._prompterState === "prompter-on") that._closePrompterWindow();
	    else that._openPrompterWindow();
	}
	this._prompterWindowCloseFunc = function () {
	    if (that._state._prompterState === "prompter-on") that._closePrompterWindow();
	}
	this._showTimeOnPrompter = function(event){
		if (that._state._prompterState === "prompter-on") {
			var font = fontFormat(event);
            window.Prompter.View.$timeOnPrompter.style['font-size'] = font.size;
			window.Prompter.View.$timeOnPrompter.style.color
				= Prompter.$showTimeLeft.style.color = font.color;
			window.Prompter.View.$timeOnPrompter.textContent
				= Prompter.$showTimeLeft.textContent = event.detail.time;
		}
		else {
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
},{"./convertTimeFromSecondsToString.js":2,"./cutContentToFitDiv.js":3,"./fontFormat.js":5,"./parseInput.js":8}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvY29udHJvbGxlci5qcyIsImpzL2NvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZy5qcyIsImpzL2N1dENvbnRlbnRUb0ZpdERpdi5qcyIsImpzL2VtaXRFdmVudC5qcyIsImpzL2ZvbnRGb3JtYXQuanMiLCJqcy9tYWluLmpzIiwianMvbW9kZWwuanMiLCJqcy9wYXJzZUlucHV0LmpzIiwianMvc2Vjb25kc0V2ZW50RW1pdHRlci5qcyIsImpzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRpbWVyID0gcmVxdWlyZSgnLi9tb2RlbC5qcycpO1xyXG52YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG5cclxudmFyIENvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdHRoaXMuX3RpbWVyID0gbnVsbDtcclxuXHR0aGlzLl9idXR0b25DbGlja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdHZhciBpbnB1dCA9IHBhcnNlSW5wdXQoKTtcclxuXHRcdGlmKCFpbnB1dC5pc1ZhbGlkKSB0aHJvdyBcIldyb25nIGlucHV0LlwiO1xyXG5cdFx0c3dpdGNoIChldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudCkge1xyXG5cdFx0XHRjYXNlIHdpbmRvdy5Qcm9tcHRlci4kYnV0dG9uQ291bnRVcCA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiY291bnQtdXBcIiwgaW5wdXQudmFsdWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudC11cFwiICYmICF0aGF0Ll90aW1lci5wYXVzZWQpIHtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyLnBhdXNlKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGF0Ll90aW1lci50eXBlID09PSBcImNvdW50LXVwXCIgJiYgdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5ydW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSB3aW5kb3cuUHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93biA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiY291bnQtZG93blwiLCBpbnB1dC52YWx1ZSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGF0Ll90aW1lci50eXBlID09PSBcImNvdW50LWRvd25cIiAmJiAhdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5wYXVzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudC1kb3duXCIgJiYgdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5ydW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSB3aW5kb3cuUHJvbXB0ZXIuJGJ1dHRvbkNvdW50RGVhZGxpbmUgOlxyXG5cdFx0XHRcdGlmKCF0aGF0Ll90aW1lcil7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lciA9IG5ldyBUaW1lcihcImRlYWRsaW5lXCIsIGlucHV0LnZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSB3aW5kb3cuUHJvbXB0ZXIuJGJ1dHRvblJlc2V0IDpcclxuXHRcdFx0XHRpZiAodGhhdC5fdGltZXIpIHRoYXQuX3RpbWVyLmNhbmNlbCgpO1xyXG5cdFx0XHRcdHRoYXQuX3RpbWVyID0gbnVsbDtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cdH1cclxuXHR3aW5kb3cuUHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoYXQuX2J1dHRvbkNsaWNrUHJvY2Vzc2luZyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0aW1lSW5TZWNvbmRzLCBmdWxsRm9ybWF0KSB7XHJcbiAgICB2YXIgaCA9IE1hdGguZmxvb3IodGltZUluU2Vjb25kcyAvICgzNjAwKSk7XHJcbiAgICB2YXIgbSA9IE1hdGguZmxvb3IoKHRpbWVJblNlY29uZHMgLSBoICogMzYwMCkgLyA2MCk7XHJcbiAgICB2YXIgcyA9IE1hdGguZmxvb3IodGltZUluU2Vjb25kcyAtIGggKiAzNjAwIC0gbSAqIDYwKTtcclxuICAgIHZhciB0aW1lU3RyaW5nID0gXCI6XCIgKyAocyA8IDEwID8gXCIwXCIgKyBzIDogcyk7XHJcbiAgICBpZihmdWxsRm9ybWF0KXtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKGggPCAxMCA/IFwiMFwiICsgaCA6IGgpICsgXCI6XCIgKyAobSA8IDEwID8gXCIwXCIgKyBtIDogbSkgKyB0aW1lU3RyaW5nO1xyXG4gICAgfWVsc2Uge1xyXG4gICAgICAgIGlmIChoID4gMCkge1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gaCArIFwiOlwiICsgKG0gPCAxMCA/IFwiMFwiICsgbSA6IG0pICsgdGltZVN0cmluZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gbSArIHRpbWVTdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWVTdHJpbmc7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIHRlbXAgPSB3aW5kb3cuUHJvbXB0ZXIuVmlldy4kbWVzc2FnZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQ7XHJcblx0d2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHR2YXIgc2Nyb2xsSGVpZ2h0LFxyXG5cdFx0dG9nZ2xlID0gdHJ1ZTtcclxuXHR2YXIgaWQgPSBzZXRJbnRlcnZhbChjdXRDb250ZW50VG9GaXREaXYsIDQpO1xyXG5cdGZ1bmN0aW9uIGN1dENvbnRlbnRUb0ZpdERpdigpIHtcclxuXHRcdGlmICghc2Nyb2xsSGVpZ2h0KSBzY3JvbGxIZWlnaHQgPSB3aW5kb3cuUHJvbXB0ZXIuVmlldy4kbWVzc2FnZU9uUHJvbXB0ZXIuc2Nyb2xsSGVpZ2h0O1xyXG5cdFx0aWYodG9nZ2xlKXtcclxuXHRcdFx0d2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50ID0gdGVtcDtcclxuXHRcdFx0dG9nZ2xlID0gZmFsc2U7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZih3aW5kb3cuUHJvbXB0ZXIuVmlldy4kbWVzc2FnZU9uUHJvbXB0ZXIuc2Nyb2xsSGVpZ2h0ID4gc2Nyb2xsSGVpZ2h0KXtcclxuXHRcdFx0XHR0ZW1wID0gd2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50LnNsaWNlKDAsIC0xKTtcclxuXHRcdFx0XHR0b2dnbGUgPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoaWQpO1xyXG5cdFx0XHRcdHdpbmRvdy5Qcm9tcHRlci4kc2hvd01lc3NhZ2UudGV4dENvbnRlbnQgPSB0ZW1wO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBjdXN0b21FdmVudEluaXQpIHtcclxuICAgIHZhciBldm50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgY3VzdG9tRXZlbnRJbml0KTtcclxuICAgIFByb21wdGVyLiRib2R5LmRpc3BhdGNoRXZlbnQoZXZudCk7XHJcbn0iLCJ2YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHR2YXIgZm9udENvbG9yID0gXCJcIjtcclxuXHR2YXIgdGltZUxlZnRTZWNvbmRzID0gSW5maW5pdHk7XHJcblx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSl7XHJcblx0XHRjYXNlIFwiY291bnQtdXBcIjpcclxuXHRcdFx0aWYoZXZlbnQuZGV0YWlsLmRlYWRsaW5lICE9PSBcIjA6MDBcIil7XHJcblx0XHRcdFx0dGltZUxlZnRTZWNvbmRzID0gcGFyc2VJbnB1dChldmVudC5kZXRhaWwuZGVhZGxpbmUpLnZhbHVlXHJcblx0XHRcdFx0XHQtIHBhcnNlSW5wdXQoZXZlbnQuZGV0YWlsLnRpbWUpLnZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiY291bnQtZG93blwiOlxyXG5cdFx0XHR0aW1lTGVmdFNlY29uZHMgPSBwYXJzZUlucHV0KGV2ZW50LmRldGFpbC50aW1lKS52YWx1ZTtcclxuXHRcdFx0YnJlYWtcclxuXHRcdGNhc2UgXCJkZWFkbGluZVwiOlxyXG5cdFx0XHR0aW1lTGVmdFNlY29uZHMgPSBwYXJzZUlucHV0KGV2ZW50LmRldGFpbC50aW1lKS52YWx1ZTtcclxuXHRcdFx0YnJlYWtcclxuXHR9XHJcblx0aWYodGltZUxlZnRTZWNvbmRzID4gMTIwKXtcclxuXHRcdGZvbnRDb2xvciA9IFwiXCI7XHJcblx0fSBlbHNlIGlmICh0aW1lTGVmdFNlY29uZHMgPiA2MCkge1xyXG5cdFx0Zm9udENvbG9yID0gXCJvcmFuZ2VcIjtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Zm9udENvbG9yID0gXCJyZWRcIjtcclxuXHR9XHJcbiAgICB2YXIgZm9udFNpemUgPSB1bmRlZmluZWQ7XHJcbiAgICB2YXIgbWluRm9udFNpemUgPSAyMztcclxuICAgIHZhciBtYXhGb250U2l6ZSA9IDQwO1xyXG4gICAgdmFyIG1pblN0cmluZ0xlbmd0aCA9IDQ7XHJcbiAgICB2YXIgbWF4U3RyaW5nTGVuZ3RoID0gODtcclxuICAgIGZvbnRTaXplID0gTWF0aC5mbG9vcihtaW5Gb250U2l6ZSBcclxuICAgIFx0KyAobWF4U3RyaW5nTGVuZ3RoIC0gZXZlbnQuZGV0YWlsLnRpbWUubGVuZ3RoKVxyXG4gICAgICAgICogKG1heEZvbnRTaXplIC0gbWluRm9udFNpemUpIC8gKG1heFN0cmluZ0xlbmd0aCAtIG1pblN0cmluZ0xlbmd0aCkpO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0Y29sb3I6IGZvbnRDb2xvcixcclxuXHRcdHNpemU6IGZvbnRTaXplICsgJ3Z3J1xyXG5cdH1cclxufVxyXG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICB3aW5kb3cuUHJvbXB0ZXIgPSB7XHJcbiAgICAgICAgJGJvZHk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLFxyXG4gICAgICAgICRidXR0b25Db3VudFVwOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI3VwXCIpLFxyXG4gICAgICAgICRidXR0b25Db3VudERvd246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jZG93blwiKSxcclxuICAgICAgICAkaW5wdXRBbmREaXNwbGF5VGltZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0I3RpbWVcIiksXHJcbiAgICAgICAgJGJ1dHRvbkNvdW50RGVhZGxpbmU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jZGVhZGxpbmVfc3RhcnRcIiksXHJcbiAgICAgICAgJGJ1dHRvblJlc2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI3Jlc2V0XCIpLFxyXG4gICAgICAgICRpbnB1dE1lc3NhZ2U6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJ0ZXh0YXJlYSNtZXNzYWdlXCIpLFxyXG4gICAgICAgICRzaG93VGltZUxlZnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjdGltZV9sZWZ0XCIpLFxyXG4gICAgICAgICRzaG93TWVzc2FnZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIiksXHJcbiAgICAgICAgVmlldzoge31cclxuICAgIH07XHJcblx0dmFyIENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIuanMnKTtcclxuXHR2YXIgVmlldyA9IHJlcXVpcmUoXCIuL3ZpZXcuanNcIik7XHJcbiAgICByZXF1aXJlKCcuL3NlY29uZHNFdmVudEVtaXR0ZXIuanMnKTtcclxuICAgIHZhciBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTtcclxuICAgIHZhciB2aWV3ID0gbmV3IFZpZXcoKTtcclxufSIsInZhciBjb252ZXJ0VG9TdHJpbmcgPSByZXF1aXJlKFwiLi9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanNcIik7XG52YXIgZW1pdCA9IHJlcXVpcmUoXCIuL2VtaXRFdmVudFwiKTtcblxudmFyIFRpbWVyID0gZnVuY3Rpb24gKHR5cGVPZlRpbWVyLCBlbnRlcmVkVGltZUluU2Vjb25kcykge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuZW1pdCA9IGVtaXQ7XG5cdHRoaXMudHlwZSA9IHR5cGVPZlRpbWVyO1xuXHRzd2l0Y2ggKHR5cGVPZlRpbWVyKXtcblx0XHRjYXNlIFwiY291bnQtdXBcIjpcblx0XHRcdHRoaXMudGltZXJWYWx1ZSA9IDA7XG5cdFx0XHR0aGlzLmRlYWRsaW5lID0gZW50ZXJlZFRpbWVJblNlY29uZHM7XG5cdFx0XHR0aGlzLnRpbWVMZWZ0ID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZSsrO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0aWYodGhhdC50aW1lclZhbHVlID09PSB0aGF0LmRlYWRsaW5lICYmIHRoYXQuZGVhZGxpbmUpIHtcblx0XHRcdFx0XHR0aGF0LnBhdXNlKCk7XG5cdFx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lT3ZlcicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHdpbmRvdy5Qcm9tcHRlci4kYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUGF1c2VkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHR3aW5kb3cuUHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gZmFsc2U7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJSdW4nLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgXCJjb3VudC1kb3duXCI6XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUgPSAoZW50ZXJlZFRpbWVJblNlY29uZHMpID8gZW50ZXJlZFRpbWVJblNlY29uZHMgOiAzNTk5O1xuXHRcdFx0dGhpcy5kZWFkbGluZSA9IDA7XG5cdFx0XHR0aGlzLnRpbWVMZWZ0ID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZS0tO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0aWYodGhhdC50aW1lclZhbHVlID09PSAwKSB7XG5cdFx0XHRcdFx0dGhhdC5wYXVzZSgpO1xuXHRcdFx0XHRcdHRoYXQuZW1pdCgndGltZU92ZXInLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucGF1c2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHR3aW5kb3cuUHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclBhdXNlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0d2luZG93LlByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0XHR0aGF0LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUnVuJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIFwiZGVhZGxpbmVcIjpcblx0XHRcdHZhciBlbnRlcmVkVGltZSA9IGNvbnZlcnRUb1N0cmluZyhlbnRlcmVkVGltZUluU2Vjb25kcywgdHJ1ZSk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lID0gbmV3IERhdGUoKTtcblx0XHRcdHRoaXMuZGVhZGxpbmUuc2V0SG91cnMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygwLCAyKSk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lLnNldE1pbnV0ZXMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygzLCA1KSk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lLnNldFNlY29uZHMoK2VudGVyZWRUaW1lLnN1YnN0cmluZyg2KSk7XG5cdFx0XHRpZiAodGhpcy5kZWFkbGluZSA8IG5ldyBEYXRlKCkpIHtcblx0XHRcdFx0dGhpcy5kZWFkbGluZS5zZXREYXRlKHRoaXMuZGVhZGxpbmUuZ2V0RGF0ZSgpICsgMSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmRlYWRsaW5lLmZyb21EYXRlVG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICh0aGF0LmRlYWRsaW5lLmdldEhvdXJzKCkgKyAnOicgKyB0aGF0LmRlYWRsaW5lLmdldE1pbnV0ZXMoKSArICc6JyArIHRoYXQuZGVhZGxpbmUuZ2V0U2Vjb25kcygpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMudGltZXJWYWx1ZSA9IE1hdGguZmxvb3IoKHRoaXMuZGVhZGxpbmUgLSBuZXcgRGF0ZSgpKSAvIDEwMDApO1xuXHRcdFx0dGhpcy50aW1lTGVmdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhhdC50aW1lclZhbHVlID0gTWF0aC5mbG9vcigodGhhdC5kZWFkbGluZSAtIG5ldyBEYXRlKCkpIC8gMTAwMCk7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJDaGFuZ2VkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0XHRpZiAodGhhdC50aW1lclZhbHVlID09PSAwKXtcblx0XHRcdFx0XHR3aW5kb3cuUHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lT3ZlcicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0fVxuXHR0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uKCl7XG5cdFx0d2luZG93LlByb21wdGVyLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdHRoYXQuZW1pdCgndGltZXJDYW5jZWxsZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdH1cblx0dGhpcy5lbWl0KCd0aW1lclN0YXJ0ZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdHdpbmRvdy5Qcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0ZnVuY3Rpb24gY3VzdG9tRGV0YWlsKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRkZXRhaWw6IHtcblx0XHRcdFx0dHlwZTogdHlwZU9mVGltZXIsXG5cdFx0XHRcdHRpbWU6IGNvbnZlcnRUb1N0cmluZyh0aGF0LnRpbWVyVmFsdWUpLFxuXHRcdFx0XHRkZWFkbGluZTogKHR5cGVPZlRpbWVyID09PSBcImRlYWRsaW5lXCIpID8gdGhhdC5kZWFkbGluZS5mcm9tRGF0ZVRvU3RyaW5nKCkgOiBjb252ZXJ0VG9TdHJpbmcodGhhdC5kZWFkbGluZSlcblx0XHRcdH1cblx0XHR9XHRcblx0fSBcblx0cmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7IiwiLyogZ2xvYmFsIFByb21wdGVyICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpbWVTdHJpbmcpIHtcclxuICAgIGlmICghdGltZVN0cmluZykge1xyXG4gICAgICAgIHRpbWVTdHJpbmcgPSAoUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWVcclxuICAgICAgICAgICAgPyBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA6IDApO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICB2YWx1ZTogTmFOLFxyXG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBpZiAoaXNOYU4odGltZVN0cmluZykpIHtcclxuICAgICAgICB2YXIgdmFsaWRDaGFycyA9IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCBcIjpcIl07XHJcbiAgICAgICAgdmFyIHRpbWVOdW1iZXIgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGltZVN0cmluZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgaXNDaGFyVmFsaWQgPSB2YWxpZENoYXJzLnNvbWUoZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lU3RyaW5nW2ldID09IGl0ZW07XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGlmICghaXNDaGFyVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwi0JTQvtC/0YPRgdGC0LjQvNC+INCy0LLQvtC00LjRgtGMINGC0L7Qu9GM0LrQviDRhtC40YTRgNGLINC4INC00LLQvtC10YLQvtGH0LjRjy5cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRpbWVTdHJpbmdbaV0gIT09IFwiOlwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lTnVtYmVyID0gdGltZU51bWJlciAqIDEwICsgKCt0aW1lU3RyaW5nW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB0aW1lTnVtYmVyID0gdGltZVN0cmluZztcclxuXHJcbiAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKHRpbWVOdW1iZXIgLyAxMDAwMCk7XHJcbiAgICBpZiAoaG91cnMgPiAyMykge1xyXG4gICAgICAgIGFsZXJ0KFwi0JfQvdCw0YfQtdC90LjQtSAn0YfQsNGB0L7Qsicg0LHQvtC70YzRiNC1IDIzLlwiKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcbiAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoKHRpbWVOdW1iZXIgLSBob3VycyAqIDEwMDAwKSAvIDEwMCk7XHJcbiAgICBpZiAobWludXRlcyA+IDU5KSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfQvNC40L3Rg9GCJyDQsdC+0LvRjNGI0LUgNTkuXCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lTnVtYmVyIC0gaG91cnMgKiAxMDAwMCAtIG1pbnV0ZXMgKiAxMDApO1xyXG4gICAgaWYgKHNlY29uZHMgPiA1OSkge1xyXG4gICAgICAgIGFsZXJ0KFwi0JfQvdCw0YfQtdC90LjQtSAn0YHQtdC60YPQvdC0JyDQsdC+0LvRjNGI0LUgNTkuXCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciB0aW1lSW5TZWNvbmRzID0gaG91cnMgKiAzNjAwICsgbWludXRlcyAqIDYwICsgc2Vjb25kcztcclxuICAgIHJldHVybiByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IHRpbWVJblNlY29uZHMsXHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZVxyXG4gICAgfVxyXG59XHJcbiIsInZhciBlbWl0ID0gcmVxdWlyZSgnLi9lbWl0RXZlbnQnKTtcclxudmFyIGN1cnJlbnRUaW1lSW5TZWNvbmRzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbnZhciBpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZW1pdEV2ZW50RXZlcnlTZWNvbmQsIDEwMCk7XHJcblxyXG5mdW5jdGlvbiBlbWl0RXZlbnRFdmVyeVNlY29uZCgpIHtcclxuICAgIHZhciBuZXdUaW1lSW5TZWNvbmRzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbiAgICBpZiAoY3VycmVudFRpbWVJblNlY29uZHMgIT09IG5ld1RpbWVJblNlY29uZHMpIHtcclxuICAgICAgICBjdXJyZW50VGltZUluU2Vjb25kcyA9IG5ld1RpbWVJblNlY29uZHM7XHJcbiAgICAgICAgZW1pdCgnbmV3U2Vjb25kJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsIi8qIGdsb2JhbCBQcm9tcHRlciAqL1xyXG52YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG52YXIgdG9TdHIgPSByZXF1aXJlKCcuL2NvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZy5qcycpO1xyXG52YXIgZm9udEZvcm1hdCA9IHJlcXVpcmUoXCIuL2ZvbnRGb3JtYXQuanNcIik7XHJcbnZhciBjdXRDb250ZW50VG9GaXQgPSByZXF1aXJlKFwiLi9jdXRDb250ZW50VG9GaXREaXYuanNcIik7XHJcblxyXG52YXIgVmlldyA9IGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0dGhpcy5fc3RhdGUgPSB7XHJcblx0XHRfcHJvbXB0ZXJTdGF0ZTogXCJwcm9tcHRlci1vZmZcIixcclxuXHRcdHByb21wdGVyU3RhdGVTZXQ6IGZ1bmN0aW9uKHN0cil7XHJcblx0XHRcdGlmKHN0cj09PVwicHJvbXB0ZXItb2ZmXCIgfHwgc3RyPT09XCJwcm9tcHRlci1vblwiKSB7XHJcblx0XHRcdFx0dGhhdC5fc3RhdGUuX3Byb21wdGVyU3RhdGUgPSBzdHI7XHJcblx0XHRcdFx0dGhhdC5fc3RhdGUuX3NlbmQoKTtcclxuXHRcdFx0fSBlbHNlIHRocm93IEVycm9yO1xyXG5cdFx0fSxcclxuXHRcdF90aW1lclN0YXRlOiBcIm5vLXRpbWVyXCIsXHJcblx0XHR0aW1lclN0YXRlU2V0OiBmdW5jdGlvbihzdHIpe1xyXG5cdFx0XHRpZihzdHI9PT1cIm5vLXRpbWVyXCIgfHwgc3RyPT09XCJjb3VudC11cFwiIHx8IHN0cj09PVwiY291bnQtdXAtcGF1c2VkXCIgXHJcblx0XHRcdHx8IHN0cj09PVwiY291bnQtdXAtb3ZlclwiIHx8IHN0cj09PVwiY291bnQtZG93blwiIHx8IHN0cj09PVwiY291bnQtZG93bi1wYXVzZWRcIiBcclxuXHRcdFx0fHwgc3RyPT09XCJjb3VudC1kb3duLW92ZXJcIiB8fCBzdHI9PT1cImRlYWRsaW5lXCIgIHx8IHN0cj09PVwiZGVhZGxpbmUtb3ZlclwiKSB7XHJcblx0XHRcdFx0dGhhdC5fc3RhdGUuX3RpbWVyU3RhdGUgPSBzdHI7XHJcblx0XHRcdFx0dGhhdC5fc3RhdGUuX3NlbmQoKTtcclxuXHRcdFx0fSBlbHNlIHRocm93IEVycm9yO1xyXG5cdFx0fSxcclxuXHRcdF9zZW5kOiBmdW5jdGlvbigpe1xyXG5cdFx0XHRQcm9tcHRlci4kYm9keS5jbGFzc05hbWUgPSB0aGF0Ll9zdGF0ZS5fcHJvbXB0ZXJTdGF0ZSArIFwiIFwiIFxyXG5cdFx0XHQrIHRoYXQuX3N0YXRlLl90aW1lclN0YXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGF0Ll9zdGF0ZS5fc2VuZCgpO1xyXG5cdHRoaXMuXyRwcm9tcHRlcldpbmRvd0J1dHRvbk9uT2ZmID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNzY3JlZW4yXCIpO1xyXG5cdHRoaXMuX3Byb21wdGVyV2luZG93ID0gbnVsbDtcclxuXHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kdGltZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiRtZXNzYWdlT25Qcm9tcHRlciA9IG51bGw7XHJcblxyXG5cdHRoaXMuX3Byb2Nlc3NLZXlEb3duID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0ICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG5cdCAgICAgICAgdGhhdC5fcHJvY2Vzc01lc3NhZ2UoKTtcclxuXHQgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0ICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcclxuXHRcdFx0UHJvbXB0ZXIuJGlucHV0TWVzc2FnZS52YWx1ZSA9IFwiXCI7XHJcblx0ICAgIH1cclxuXHR9XHJcblx0dGhpcy5fcHJvY2Vzc01lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll9zdGF0ZS5fcHJvbXB0ZXJTdGF0ZSA9PT0gXCJwcm9tcHRlci1vblwiKSB7XHJcblx0ICAgICAgICB0aGF0Ll9zaG93TWVzc2FnZSgpO1xyXG5cdCAgICB9IGVsc2Uge1xyXG5cdCAgICBcdHRoYXQuX29wZW5Qcm9tcHRlcldpbmRvdygpO1xyXG5cdCAgICB9XHJcblx0fVxyXG5cdHRoaXMuX3Nob3dNZXNzYWdlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0d2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50XHJcblx0XHQ9IFByb21wdGVyLiRzaG93TWVzc2FnZS50ZXh0Q29udGVudCA9IFByb21wdGVyLiRpbnB1dE1lc3NhZ2UudmFsdWU7XHJcblx0XHRQcm9tcHRlci4kaW5wdXRNZXNzYWdlLnZhbHVlID0gXCJcIjtcclxuXHRcdGN1dENvbnRlbnRUb0ZpdCgpO1xyXG5cdH1cclxuXHR0aGlzLl90aW1lclN0YXJ0ZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fc3RhdGUudGltZXJTdGF0ZVNldChldmVudC5kZXRhaWwudHlwZSk7XHJcblx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpO1xyXG5cdFx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSkge1xyXG5cdFx0XHRjYXNlIFwiY291bnQtdXBcIjpcclxuXHRcdFx0Y2FzZSBcImRlYWRsaW5lXCI6XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgPSBldmVudC5kZXRhaWwuZGVhZGxpbmU7XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBcImNvdW50LWRvd25cIjpcclxuXHRcdFx0XHRQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA9IGV2ZW50LmRldGFpbC50aW1lO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyUGF1c2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuX3N0YXRlLnRpbWVyU3RhdGVTZXQoZXZlbnQuZGV0YWlsLnR5cGUgKyBcIi1wYXVzZWRcIik7XHJcblx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpXHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyUnVuID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuX3N0YXRlLnRpbWVyU3RhdGVTZXQoZXZlbnQuZGV0YWlsLnR5cGUpO1xyXG5cdFx0dGhhdC5fc2hvd1RpbWVPblByb21wdGVyKGV2ZW50KVxyXG5cdH1cclxuXHR0aGlzLl90aW1lckNhbmNlbGxlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR0aGF0Ll9zdGF0ZS50aW1lclN0YXRlU2V0KFwibm8tdGltZXJcIik7XHJcblx0XHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kdGltZU9uUHJvbXB0ZXIudGV4dENvbnRlbnRcclxuXHRcdFx0PSBQcm9tcHRlci4kc2hvd1RpbWVMZWZ0LnRleHRDb250ZW50ID0gXCJcIjtcclxuXHQgICAgUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgPSBcIlwiO1xyXG5cdH1cclxuXHR0aGlzLl90aW1lT3ZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR0aGF0Ll9zdGF0ZS50aW1lclN0YXRlU2V0KGV2ZW50LmRldGFpbC50eXBlICsgXCItb3ZlclwiKTtcclxuXHRcdHRoYXQuX3Nob3dUaW1lT25Qcm9tcHRlcihldmVudClcclxuXHR9XHJcblx0dGhpcy5fb3BlblByb21wdGVyV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0ICAgIHZhciBzdHJXaW5kb3dGZWF0dXJlcyA9IFwibWVudWJhcj1ubywgbG9jYXRpb249bm8sIGxvY2F0aW9uYmFyPW5vXCI7XHJcblx0XHRzdHJXaW5kb3dGZWF0dXJlcyArPSBcInRvb2xiYXI9bm8sIHBlcnNvbmFsYmFyPW5vLCBzdGF0dXM9bm9cIjtcclxuXHRcdHN0cldpbmRvd0ZlYXR1cmVzICs9IFwicmVzaXphYmxlPXllcywgc2Nyb2xsYmFycz1ubyxzdGF0dXM9bm9cIjtcclxuXHQgICAgdmFyIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSA9IFwiaGVpZ2h0PTMwMCx3aWR0aD01MDBcIjtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cgPSB3aW5kb3cub3BlbihcInByb21wdGVyLmh0bWxcIiwgXCJwcm9tcHRlclwiXHJcblx0XHRcdCwgc3RyV2luZG93UG9zaXRpb25BbmRTaXplICsgXCIsXCIgKyBzdHJXaW5kb3dGZWF0dXJlcyk7XHJcblx0ICAgIGlmKCF0aGF0Ll9wcm9tcHRlcldpbmRvdykgcmV0dXJuO1xyXG5cdCAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG5cdCAgICAgICAgd2luZG93LlByb21wdGVyLlZpZXcuJHRpbWVPblByb21wdGVyXHJcblx0XHRcdFx0PSB0aGF0Ll9wcm9tcHRlcldpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3RpbWVfbGVmdFwiKTtcclxuXHQgICAgICAgIHdpbmRvdy5Qcm9tcHRlci5WaWV3LiRtZXNzYWdlT25Qcm9tcHRlclxyXG5cdFx0XHRcdD0gdGhhdC5fcHJvbXB0ZXJXaW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIik7XHJcblx0ICAgICAgICB0aGF0Ll9zdGF0ZS5wcm9tcHRlclN0YXRlU2V0KFwicHJvbXB0ZXItb25cIik7XHJcblx0ICAgICAgICB0aGF0Ll9zaG93TWVzc2FnZSgpO1xyXG5cdFx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnLCB0aGF0Ll9wcm9tcHRlcldpbmRvd0Nsb3NlRnVuYyk7XHJcblx0ICAgICAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnLCB0aGF0Ll9jbG9zZVByb21wdGVyV2luZG93KTtcclxuXHQgICAgICAgIHRoYXQuX3Byb21wdGVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoYXQuY3V0Q29udGVudFRvRml0KTtcclxuXHQgICAgfSk7XHJcblx0fVxyXG5cdHRoaXMuX2Nsb3NlUHJvbXB0ZXJXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHQgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHRoYXQuX3Byb21wdGVyV2luZG93Q2xvc2VGdW5jKTtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdyk7XHJcblx0ICAgIHRoYXQuX3Byb21wdGVyV2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoYXQuX3Nob3dNZXNzYWdlKTtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuY2xvc2UoKTtcclxuXHRcdHRoYXQuX3Byb21wdGVyV2luZG93ID0gbnVsbDtcclxuXHRcdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiR0aW1lT25Qcm9tcHRlciA9IG51bGw7XHJcblx0XHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kbWVzc2FnZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cdFx0UHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHQgICAgdGhhdC5fc3RhdGUucHJvbXB0ZXJTdGF0ZVNldChcInByb21wdGVyLW9mZlwiKTtcclxuXHR9XHJcblx0dGhpcy5fcHJvbXB0ZXJXaW5kb3dPbk9mZiA9IGZ1bmN0aW9uICgpIHtcclxuXHQgICAgaWYgKHRoYXQuX3N0YXRlLl9wcm9tcHRlclN0YXRlID09PSBcInByb21wdGVyLW9uXCIpIHRoYXQuX2Nsb3NlUHJvbXB0ZXJXaW5kb3coKTtcclxuXHQgICAgZWxzZSB0aGF0Ll9vcGVuUHJvbXB0ZXJXaW5kb3coKTtcclxuXHR9XHJcblx0dGhpcy5fcHJvbXB0ZXJXaW5kb3dDbG9zZUZ1bmMgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll9zdGF0ZS5fcHJvbXB0ZXJTdGF0ZSA9PT0gXCJwcm9tcHRlci1vblwiKSB0aGF0Ll9jbG9zZVByb21wdGVyV2luZG93KCk7XHJcblx0fVxyXG5cdHRoaXMuX3Nob3dUaW1lT25Qcm9tcHRlciA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGlmICh0aGF0Ll9zdGF0ZS5fcHJvbXB0ZXJTdGF0ZSA9PT0gXCJwcm9tcHRlci1vblwiKSB7XHJcblx0XHRcdHZhciBmb250ID0gZm9udEZvcm1hdChldmVudCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5Qcm9tcHRlci5WaWV3LiR0aW1lT25Qcm9tcHRlci5zdHlsZVsnZm9udC1zaXplJ10gPSBmb250LnNpemU7XHJcblx0XHRcdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiR0aW1lT25Qcm9tcHRlci5zdHlsZS5jb2xvclxyXG5cdFx0XHRcdD0gUHJvbXB0ZXIuJHNob3dUaW1lTGVmdC5zdHlsZS5jb2xvciA9IGZvbnQuY29sb3I7XHJcblx0XHRcdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiR0aW1lT25Qcm9tcHRlci50ZXh0Q29udGVudFxyXG5cdFx0XHRcdD0gUHJvbXB0ZXIuJHNob3dUaW1lTGVmdC50ZXh0Q29udGVudCA9IGV2ZW50LmRldGFpbC50aW1lO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHRoYXQuX29wZW5Qcm9tcHRlcldpbmRvdygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0UHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG5cdCAgICB2YXIgaW5wdXQgPSBwYXJzZUlucHV0KCk7XHJcblx0ICAgIGlmIChpbnB1dC5pc1ZhbGlkKSBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA9IHRvU3RyKGlucHV0LnZhbHVlKTtcclxuXHR9KTtcclxuXHR0aGlzLl8kcHJvbXB0ZXJXaW5kb3dCdXR0b25Pbk9mZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoYXQuX3Byb21wdGVyV2luZG93T25PZmYpO1xyXG5cdFByb21wdGVyLiRpbnB1dE1lc3NhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhhdC5fcHJvY2Vzc0tleURvd24pO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyU3RhcnRlZCcsIHRoYXQuX3RpbWVyU3RhcnRlZCk7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJDaGFuZ2VkJywgdGhhdC5fc2hvd1RpbWVPblByb21wdGVyKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lclBhdXNlZCcsIHRoYXQuX3RpbWVyUGF1c2VkKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lclJ1bicsIHRoYXQuX3RpbWVyUnVuKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lckNhbmNlbGxlZCcsIHRoYXQuX3RpbWVyQ2FuY2VsbGVkKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lT3ZlcicsIHRoYXQuX3RpbWVPdmVyKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyJdfQ==
