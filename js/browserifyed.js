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
	        Prompter.$inputMessage.textContent = "";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvY29udHJvbGxlci5qcyIsImpzL2NvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZy5qcyIsImpzL2N1dENvbnRlbnRUb0ZpdERpdi5qcyIsImpzL2VtaXRFdmVudC5qcyIsImpzL2ZvbnRGb3JtYXQuanMiLCJqcy9tYWluLmpzIiwianMvbW9kZWwuanMiLCJqcy9wYXJzZUlucHV0LmpzIiwianMvc2Vjb25kc0V2ZW50RW1pdHRlci5qcyIsImpzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBUaW1lciA9IHJlcXVpcmUoJy4vbW9kZWwuanMnKTtcclxudmFyIHBhcnNlSW5wdXQgPSByZXF1aXJlKCcuL3BhcnNlSW5wdXQuanMnKTtcclxuXHJcbnZhciBDb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHR0aGlzLl90aW1lciA9IG51bGw7XHJcblx0dGhpcy5fYnV0dG9uQ2xpY2tQcm9jZXNzaW5nID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0XHR2YXIgaW5wdXQgPSBwYXJzZUlucHV0KCk7XHJcblx0XHRpZighaW5wdXQuaXNWYWxpZCkgdGhyb3cgXCJXcm9uZyBpbnB1dC5cIjtcclxuXHRcdHN3aXRjaCAoZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQpIHtcclxuXHRcdFx0Y2FzZSB3aW5kb3cuUHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAgOlxyXG5cdFx0XHRcdGlmKCF0aGF0Ll90aW1lcil7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lciA9IG5ldyBUaW1lcihcImNvdW50LXVwXCIsIGlucHV0LnZhbHVlKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwiY291bnQtdXBcIiAmJiAhdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5wYXVzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudC11cFwiICYmIHRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucnVuKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2Ugd2luZG93LlByb21wdGVyLiRidXR0b25Db3VudERvd24gOlxyXG5cdFx0XHRcdGlmKCF0aGF0Ll90aW1lcil7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lciA9IG5ldyBUaW1lcihcImNvdW50LWRvd25cIiwgaW5wdXQudmFsdWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudC1kb3duXCIgJiYgIXRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucGF1c2UoKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwiY291bnQtZG93blwiICYmIHRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucnVuKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2Ugd2luZG93LlByb21wdGVyLiRidXR0b25Db3VudERlYWRsaW5lIDpcclxuXHRcdFx0XHRpZighdGhhdC5fdGltZXIpe1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIgPSBuZXcgVGltZXIoXCJkZWFkbGluZVwiLCBpbnB1dC52YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2Ugd2luZG93LlByb21wdGVyLiRidXR0b25SZXNldCA6XHJcblx0XHRcdFx0aWYgKHRoYXQuX3RpbWVyKSB0aGF0Ll90aW1lci5jYW5jZWwoKTtcclxuXHRcdFx0XHR0aGF0Ll90aW1lciA9IG51bGw7XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0d2luZG93LlByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGF0Ll9idXR0b25DbGlja1Byb2Nlc3NpbmcpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGltZUluU2Vjb25kcywgZnVsbEZvcm1hdCkge1xyXG4gICAgdmFyIGggPSBNYXRoLmZsb29yKHRpbWVJblNlY29uZHMgLyAoMzYwMCkpO1xyXG4gICAgdmFyIG0gPSBNYXRoLmZsb29yKCh0aW1lSW5TZWNvbmRzIC0gaCAqIDM2MDApIC8gNjApO1xyXG4gICAgdmFyIHMgPSBNYXRoLmZsb29yKHRpbWVJblNlY29uZHMgLSBoICogMzYwMCAtIG0gKiA2MCk7XHJcbiAgICB2YXIgdGltZVN0cmluZyA9IFwiOlwiICsgKHMgPCAxMCA/IFwiMFwiICsgcyA6IHMpO1xyXG4gICAgaWYoZnVsbEZvcm1hdCl7XHJcbiAgICAgICAgdGltZVN0cmluZyA9IChoIDwgMTAgPyBcIjBcIiArIGggOiBoKSArIFwiOlwiICsgKG0gPCAxMCA/IFwiMFwiICsgbSA6IG0pICsgdGltZVN0cmluZztcclxuICAgIH1lbHNlIHtcclxuICAgICAgICBpZiAoaCA+IDApIHtcclxuICAgICAgICAgICAgdGltZVN0cmluZyA9IGggKyBcIjpcIiArIChtIDwgMTAgPyBcIjBcIiArIG0gOiBtKSArIHRpbWVTdHJpbmc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGltZVN0cmluZyA9IG0gKyB0aW1lU3RyaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aW1lU3RyaW5nO1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xyXG5cdHZhciB0ZW1wID0gd2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50O1xyXG5cdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudCA9IFwiXCI7XHJcblx0dmFyIHNjcm9sbEhlaWdodCxcclxuXHRcdHRvZ2dsZSA9IHRydWU7XHJcblx0dmFyIGlkID0gc2V0SW50ZXJ2YWwoY3V0Q29udGVudFRvRml0RGl2LCA0KTtcclxuXHRmdW5jdGlvbiBjdXRDb250ZW50VG9GaXREaXYoKSB7XHJcblx0XHRpZiAoIXNjcm9sbEhlaWdodCkgc2Nyb2xsSGVpZ2h0ID0gd2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnNjcm9sbEhlaWdodDtcclxuXHRcdGlmKHRvZ2dsZSl7XHJcblx0XHRcdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudCA9IHRlbXA7XHJcblx0XHRcdHRvZ2dsZSA9IGZhbHNlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYod2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyLnNjcm9sbEhlaWdodCA+IHNjcm9sbEhlaWdodCl7XHJcblx0XHRcdFx0dGVtcCA9IHdpbmRvdy5Qcm9tcHRlci5WaWV3LiRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudC5zbGljZSgwLCAtMSk7XHJcblx0XHRcdFx0dG9nZ2xlID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjbGVhckludGVydmFsKGlkKTtcclxuXHRcdFx0XHR3aW5kb3cuUHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gdGVtcDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgY3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICB2YXIgZXZudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIGN1c3RvbUV2ZW50SW5pdCk7XHJcbiAgICBQcm9tcHRlci4kYm9keS5kaXNwYXRjaEV2ZW50KGV2bnQpO1xyXG59IiwidmFyIHBhcnNlSW5wdXQgPSByZXF1aXJlKCcuL3BhcnNlSW5wdXQuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0dmFyIGZvbnRDb2xvciA9IFwiXCI7XHJcblx0dmFyIHRpbWVMZWZ0U2Vjb25kcyA9IEluZmluaXR5O1xyXG5cdHN3aXRjaCAoZXZlbnQuZGV0YWlsLnR5cGUpe1xyXG5cdFx0Y2FzZSBcImNvdW50LXVwXCI6XHJcblx0XHRcdGlmKGV2ZW50LmRldGFpbC5kZWFkbGluZSAhPT0gXCIwOjAwXCIpe1xyXG5cdFx0XHRcdHRpbWVMZWZ0U2Vjb25kcyA9IHBhcnNlSW5wdXQoZXZlbnQuZGV0YWlsLmRlYWRsaW5lKS52YWx1ZVxyXG5cdFx0XHRcdFx0LSBwYXJzZUlucHV0KGV2ZW50LmRldGFpbC50aW1lKS52YWx1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRicmVha1xyXG5cdFx0Y2FzZSBcImNvdW50LWRvd25cIjpcclxuXHRcdFx0dGltZUxlZnRTZWNvbmRzID0gcGFyc2VJbnB1dChldmVudC5kZXRhaWwudGltZSkudmFsdWU7XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiZGVhZGxpbmVcIjpcclxuXHRcdFx0dGltZUxlZnRTZWNvbmRzID0gcGFyc2VJbnB1dChldmVudC5kZXRhaWwudGltZSkudmFsdWU7XHJcblx0XHRcdGJyZWFrXHJcblx0fVxyXG5cdGlmKHRpbWVMZWZ0U2Vjb25kcyA+IDEyMCl7XHJcblx0XHRmb250Q29sb3IgPSBcIlwiO1xyXG5cdH0gZWxzZSBpZiAodGltZUxlZnRTZWNvbmRzID4gNjApIHtcclxuXHRcdGZvbnRDb2xvciA9IFwib3JhbmdlXCI7XHJcblx0fSBlbHNlIHtcclxuXHRcdGZvbnRDb2xvciA9IFwicmVkXCI7XHJcblx0fVxyXG4gICAgdmFyIGZvbnRTaXplID0gdW5kZWZpbmVkO1xyXG4gICAgdmFyIG1pbkZvbnRTaXplID0gMjM7XHJcbiAgICB2YXIgbWF4Rm9udFNpemUgPSA0MDtcclxuICAgIHZhciBtaW5TdHJpbmdMZW5ndGggPSA0O1xyXG4gICAgdmFyIG1heFN0cmluZ0xlbmd0aCA9IDg7XHJcbiAgICBmb250U2l6ZSA9IE1hdGguZmxvb3IobWluRm9udFNpemUgXHJcbiAgICBcdCsgKG1heFN0cmluZ0xlbmd0aCAtIGV2ZW50LmRldGFpbC50aW1lLmxlbmd0aClcclxuICAgICAgICAqIChtYXhGb250U2l6ZSAtIG1pbkZvbnRTaXplKSAvIChtYXhTdHJpbmdMZW5ndGggLSBtaW5TdHJpbmdMZW5ndGgpKTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGNvbG9yOiBmb250Q29sb3IsXHJcblx0XHRzaXplOiBmb250U2l6ZSArICd2dydcclxuXHR9XHJcbn1cclxuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgd2luZG93LlByb21wdGVyID0ge1xyXG4gICAgICAgICRib2R5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKSxcclxuICAgICAgICAkYnV0dG9uQ291bnRVcDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiN1cFwiKSxcclxuICAgICAgICAkYnV0dG9uQ291bnREb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2Rvd25cIiksXHJcbiAgICAgICAgJGlucHV0QW5kRGlzcGxheVRpbWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dCN0aW1lXCIpLFxyXG4gICAgICAgICRidXR0b25Db3VudERlYWRsaW5lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2RlYWRsaW5lX3N0YXJ0XCIpLFxyXG4gICAgICAgICRidXR0b25SZXNldDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNyZXNldFwiKSxcclxuICAgICAgICAkaW5wdXRNZXNzYWdlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidGV4dGFyZWEjbWVzc2FnZVwiKSxcclxuICAgICAgICAkc2hvd1RpbWVMZWZ0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3RpbWVfbGVmdFwiKSxcclxuICAgICAgICAkc2hvd01lc3NhZ2U6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjbWVzc2FnZV9zaG93XCIpLFxyXG4gICAgICAgIFZpZXc6IHt9XHJcbiAgICB9O1xyXG5cdHZhciBDb250cm9sbGVyID0gcmVxdWlyZSgnLi9jb250cm9sbGVyLmpzJyk7XHJcblx0dmFyIFZpZXcgPSByZXF1aXJlKFwiLi92aWV3LmpzXCIpO1xyXG4gICAgcmVxdWlyZSgnLi9zZWNvbmRzRXZlbnRFbWl0dGVyLmpzJyk7XHJcbiAgICB2YXIgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XHJcbiAgICB2YXIgdmlldyA9IG5ldyBWaWV3KCk7XHJcbn0iLCJ2YXIgY29udmVydFRvU3RyaW5nID0gcmVxdWlyZShcIi4vY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzXCIpO1xudmFyIGVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XG5cbnZhciBUaW1lciA9IGZ1bmN0aW9uICh0eXBlT2ZUaW1lciwgZW50ZXJlZFRpbWVJblNlY29uZHMpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmVtaXQgPSBlbWl0O1xuXHR0aGlzLnR5cGUgPSB0eXBlT2ZUaW1lcjtcblx0c3dpdGNoICh0eXBlT2ZUaW1lcil7XG5cdFx0Y2FzZSBcImNvdW50LXVwXCI6XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUgPSAwO1xuXHRcdFx0dGhpcy5kZWFkbGluZSA9IGVudGVyZWRUaW1lSW5TZWNvbmRzO1xuXHRcdFx0dGhpcy50aW1lTGVmdCA9IGZ1bmN0aW9uICgpe1xuXHRcdFx0XHR0aGF0LnRpbWVyVmFsdWUrKztcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lckNoYW5nZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdGlmKHRoYXQudGltZXJWYWx1ZSA9PT0gdGhhdC5kZWFkbGluZSAmJiB0aGF0LmRlYWRsaW5lKSB7XG5cdFx0XHRcdFx0dGhhdC5wYXVzZSgpO1xuXHRcdFx0XHRcdHRoYXQuZW1pdCgndGltZU92ZXInLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucGF1c2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHR3aW5kb3cuUHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclBhdXNlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0d2luZG93LlByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0XHR0aGF0LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUnVuJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0XHRjYXNlIFwiY291bnQtZG93blwiOlxuXHRcdFx0dGhpcy50aW1lclZhbHVlID0gKGVudGVyZWRUaW1lSW5TZWNvbmRzKSA/IGVudGVyZWRUaW1lSW5TZWNvbmRzIDogMzU5OTtcblx0XHRcdHRoaXMuZGVhZGxpbmUgPSAwO1xuXHRcdFx0dGhpcy50aW1lTGVmdCA9IGZ1bmN0aW9uICgpe1xuXHRcdFx0XHR0aGF0LnRpbWVyVmFsdWUtLTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lckNoYW5nZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdGlmKHRoYXQudGltZXJWYWx1ZSA9PT0gMCkge1xuXHRcdFx0XHRcdHRoYXQucGF1c2UoKTtcblx0XHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVPdmVyJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBhdXNlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0d2luZG93LlByb21wdGVyLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0XHR0aGF0LnBhdXNlZCA9IHRydWU7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJQYXVzZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHdpbmRvdy5Qcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclJ1bicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBcImRlYWRsaW5lXCI6XG5cdFx0XHR2YXIgZW50ZXJlZFRpbWUgPSBjb252ZXJ0VG9TdHJpbmcoZW50ZXJlZFRpbWVJblNlY29uZHMsIHRydWUpO1xuXHRcdFx0dGhpcy5kZWFkbGluZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lLnNldEhvdXJzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoMCwgMikpO1xuXHRcdFx0dGhpcy5kZWFkbGluZS5zZXRNaW51dGVzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoMywgNSkpO1xuXHRcdFx0dGhpcy5kZWFkbGluZS5zZXRTZWNvbmRzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoNikpO1xuXHRcdFx0aWYgKHRoaXMuZGVhZGxpbmUgPCBuZXcgRGF0ZSgpKSB7XG5cdFx0XHRcdHRoaXMuZGVhZGxpbmUuc2V0RGF0ZSh0aGlzLmRlYWRsaW5lLmdldERhdGUoKSArIDEpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5kZWFkbGluZS5mcm9tRGF0ZVRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAodGhhdC5kZWFkbGluZS5nZXRIb3VycygpICsgJzonICsgdGhhdC5kZWFkbGluZS5nZXRNaW51dGVzKCkgKyAnOicgKyB0aGF0LmRlYWRsaW5lLmdldFNlY29uZHMoKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUgPSBNYXRoLmZsb29yKCh0aGlzLmRlYWRsaW5lIC0gbmV3IERhdGUoKSkgLyAxMDAwKTtcblx0XHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZSA9IE1hdGguZmxvb3IoKHRoYXQuZGVhZGxpbmUgLSBuZXcgRGF0ZSgpKSAvIDEwMDApO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0aWYgKHRoYXQudGltZXJWYWx1ZSA9PT0gMCl7XG5cdFx0XHRcdFx0d2luZG93LlByb21wdGVyLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0XHRcdHRoYXQuZW1pdCgndGltZU92ZXInLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrXG5cdH1cblx0dGhpcy5jYW5jZWwgPSBmdW5jdGlvbigpe1xuXHRcdHdpbmRvdy5Qcm9tcHRlci4kYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2FuY2VsbGVkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHR9XG5cdHRoaXMuZW1pdCgndGltZXJTdGFydGVkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHR3aW5kb3cuUHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdGZ1bmN0aW9uIGN1c3RvbURldGFpbCgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGV0YWlsOiB7XG5cdFx0XHRcdHR5cGU6IHR5cGVPZlRpbWVyLFxuXHRcdFx0XHR0aW1lOiBjb252ZXJ0VG9TdHJpbmcodGhhdC50aW1lclZhbHVlKSxcblx0XHRcdFx0ZGVhZGxpbmU6ICh0eXBlT2ZUaW1lciA9PT0gXCJkZWFkbGluZVwiKSA/IHRoYXQuZGVhZGxpbmUuZnJvbURhdGVUb1N0cmluZygpIDogY29udmVydFRvU3RyaW5nKHRoYXQuZGVhZGxpbmUpXG5cdFx0XHR9XG5cdFx0fVx0XG5cdH0gXG5cdHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyOyIsIi8qIGdsb2JhbCBQcm9tcHRlciAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0aW1lU3RyaW5nKSB7XHJcbiAgICBpZiAoIXRpbWVTdHJpbmcpIHtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlXHJcbiAgICAgICAgICAgID8gUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgOiAwKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IE5hTixcclxuICAgICAgICBpc1ZhbGlkOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKHRpbWVTdHJpbmcpKSB7XHJcbiAgICAgICAgdmFyIHZhbGlkQ2hhcnMgPSBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgXCI6XCJdO1xyXG4gICAgICAgIHZhciB0aW1lTnVtYmVyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbWVTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlzQ2hhclZhbGlkID0gdmFsaWRDaGFycy5zb21lKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZVN0cmluZ1tpXSA9PSBpdGVtO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpZiAoIWlzQ2hhclZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcItCU0L7Qv9GD0YHRgtC40LzQviDQstCy0L7QtNC40YLRjCDRgtC+0LvRjNC60L4g0YbQuNGE0YDRiyDQuCDQtNCy0L7QtdGC0L7Rh9C40Y8uXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aW1lU3RyaW5nW2ldICE9PSBcIjpcIikge1xyXG4gICAgICAgICAgICAgICAgdGltZU51bWJlciA9IHRpbWVOdW1iZXIgKiAxMCArICgrdGltZVN0cmluZ1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgdGltZU51bWJlciA9IHRpbWVTdHJpbmc7XHJcblxyXG4gICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcih0aW1lTnVtYmVyIC8gMTAwMDApO1xyXG4gICAgaWYgKGhvdXJzID4gMjMpIHtcclxuICAgICAgICBhbGVydChcItCX0L3QsNGH0LXQvdC40LUgJ9GH0LDRgdC+0LInINCx0L7Qu9GM0YjQtSAyMy5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKCh0aW1lTnVtYmVyIC0gaG91cnMgKiAxMDAwMCkgLyAxMDApO1xyXG4gICAgaWYgKG1pbnV0ZXMgPiA1OSkge1xyXG4gICAgICAgIGFsZXJ0KFwi0JfQvdCw0YfQtdC90LjQtSAn0LzQuNC90YPRgicg0LHQvtC70YzRiNC1IDU5LlwiKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcbiAgICB2YXIgc2Vjb25kcyA9IE1hdGguZmxvb3IodGltZU51bWJlciAtIGhvdXJzICogMTAwMDAgLSBtaW51dGVzICogMTAwKTtcclxuICAgIGlmIChzZWNvbmRzID4gNTkpIHtcclxuICAgICAgICBhbGVydChcItCX0L3QsNGH0LXQvdC40LUgJ9GB0LXQutGD0L3QtCcg0LHQvtC70YzRiNC1IDU5LlwiKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcbiAgICB2YXIgdGltZUluU2Vjb25kcyA9IGhvdXJzICogMzYwMCArIG1pbnV0ZXMgKiA2MCArIHNlY29uZHM7XHJcbiAgICByZXR1cm4gcmVzdWx0ID0ge1xyXG4gICAgICAgIHZhbHVlOiB0aW1lSW5TZWNvbmRzLFxyXG4gICAgICAgIGlzVmFsaWQ6IHRydWVcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgZW1pdCA9IHJlcXVpcmUoJy4vZW1pdEV2ZW50Jyk7XHJcbnZhciBjdXJyZW50VGltZUluU2Vjb25kcyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG52YXIgaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGVtaXRFdmVudEV2ZXJ5U2Vjb25kLCAxMDApO1xyXG5cclxuZnVuY3Rpb24gZW1pdEV2ZW50RXZlcnlTZWNvbmQoKSB7XHJcbiAgICB2YXIgbmV3VGltZUluU2Vjb25kcyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lSW5TZWNvbmRzICE9PSBuZXdUaW1lSW5TZWNvbmRzKSB7XHJcbiAgICAgICAgY3VycmVudFRpbWVJblNlY29uZHMgPSBuZXdUaW1lSW5TZWNvbmRzO1xyXG4gICAgICAgIGVtaXQoJ25ld1NlY29uZCcpO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCIvKiBnbG9iYWwgUHJvbXB0ZXIgKi9cclxudmFyIHBhcnNlSW5wdXQgPSByZXF1aXJlKCcuL3BhcnNlSW5wdXQuanMnKTtcclxudmFyIHRvU3RyID0gcmVxdWlyZSgnLi9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanMnKTtcclxudmFyIGZvbnRGb3JtYXQgPSByZXF1aXJlKFwiLi9mb250Rm9ybWF0LmpzXCIpO1xyXG52YXIgY3V0Q29udGVudFRvRml0ID0gcmVxdWlyZShcIi4vY3V0Q29udGVudFRvRml0RGl2LmpzXCIpO1xyXG5cclxudmFyIFZpZXcgPSBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdHRoaXMuX3N0YXRlID0ge1xyXG5cdFx0X3Byb21wdGVyU3RhdGU6IFwicHJvbXB0ZXItb2ZmXCIsXHJcblx0XHRwcm9tcHRlclN0YXRlU2V0OiBmdW5jdGlvbihzdHIpe1xyXG5cdFx0XHRpZihzdHI9PT1cInByb21wdGVyLW9mZlwiIHx8IHN0cj09PVwicHJvbXB0ZXItb25cIikge1xyXG5cdFx0XHRcdHRoYXQuX3N0YXRlLl9wcm9tcHRlclN0YXRlID0gc3RyO1xyXG5cdFx0XHRcdHRoYXQuX3N0YXRlLl9zZW5kKCk7XHJcblx0XHRcdH0gZWxzZSB0aHJvdyBFcnJvcjtcclxuXHRcdH0sXHJcblx0XHRfdGltZXJTdGF0ZTogXCJuby10aW1lclwiLFxyXG5cdFx0dGltZXJTdGF0ZVNldDogZnVuY3Rpb24oc3RyKXtcclxuXHRcdFx0aWYoc3RyPT09XCJuby10aW1lclwiIHx8IHN0cj09PVwiY291bnQtdXBcIiB8fCBzdHI9PT1cImNvdW50LXVwLXBhdXNlZFwiIFxyXG5cdFx0XHR8fCBzdHI9PT1cImNvdW50LXVwLW92ZXJcIiB8fCBzdHI9PT1cImNvdW50LWRvd25cIiB8fCBzdHI9PT1cImNvdW50LWRvd24tcGF1c2VkXCIgXHJcblx0XHRcdHx8IHN0cj09PVwiY291bnQtZG93bi1vdmVyXCIgfHwgc3RyPT09XCJkZWFkbGluZVwiICB8fCBzdHI9PT1cImRlYWRsaW5lLW92ZXJcIikge1xyXG5cdFx0XHRcdHRoYXQuX3N0YXRlLl90aW1lclN0YXRlID0gc3RyO1xyXG5cdFx0XHRcdHRoYXQuX3N0YXRlLl9zZW5kKCk7XHJcblx0XHRcdH0gZWxzZSB0aHJvdyBFcnJvcjtcclxuXHRcdH0sXHJcblx0XHRfc2VuZDogZnVuY3Rpb24oKXtcclxuXHRcdFx0UHJvbXB0ZXIuJGJvZHkuY2xhc3NOYW1lID0gdGhhdC5fc3RhdGUuX3Byb21wdGVyU3RhdGUgKyBcIiBcIiBcclxuXHRcdFx0KyB0aGF0Ll9zdGF0ZS5fdGltZXJTdGF0ZTtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhhdC5fc3RhdGUuX3NlbmQoKTtcclxuXHR0aGlzLl8kcHJvbXB0ZXJXaW5kb3dCdXR0b25Pbk9mZiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jc2NyZWVuMlwiKTtcclxuXHR0aGlzLl9wcm9tcHRlcldpbmRvdyA9IG51bGw7XHJcblx0d2luZG93LlByb21wdGVyLlZpZXcuJHRpbWVPblByb21wdGVyID0gbnVsbDtcclxuXHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kbWVzc2FnZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cclxuXHR0aGlzLl9wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdCAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuXHQgICAgICAgIHRoYXQuX3Byb2Nlc3NNZXNzYWdlKCk7XHJcblx0ICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDI3KSB7XHJcblx0ICAgICAgICBQcm9tcHRlci4kaW5wdXRNZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9wcm9jZXNzTWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuXHQgICAgaWYgKHRoYXQuX3N0YXRlLl9wcm9tcHRlclN0YXRlID09PSBcInByb21wdGVyLW9uXCIpIHtcclxuXHQgICAgICAgIHRoYXQuX3Nob3dNZXNzYWdlKCk7XHJcblx0ICAgIH0gZWxzZSB7XHJcblx0ICAgIFx0dGhhdC5fb3BlblByb21wdGVyV2luZG93KCk7XHJcblx0ICAgIH1cclxuXHR9XHJcblx0dGhpcy5fc2hvd01lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kbWVzc2FnZU9uUHJvbXB0ZXIudGV4dENvbnRlbnRcclxuXHRcdD0gUHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gUHJvbXB0ZXIuJGlucHV0TWVzc2FnZS52YWx1ZTtcclxuXHRcdFByb21wdGVyLiRpbnB1dE1lc3NhZ2UudmFsdWUgPSBcIlwiO1xyXG5cdFx0Y3V0Q29udGVudFRvRml0KCk7XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyU3RhcnRlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR0aGF0Ll9zdGF0ZS50aW1lclN0YXRlU2V0KGV2ZW50LmRldGFpbC50eXBlKTtcclxuXHRcdHRoYXQuX3Nob3dUaW1lT25Qcm9tcHRlcihldmVudCk7XHJcblx0XHRzd2l0Y2ggKGV2ZW50LmRldGFpbC50eXBlKSB7XHJcblx0XHRcdGNhc2UgXCJjb3VudC11cFwiOlxyXG5cdFx0XHRjYXNlIFwiZGVhZGxpbmVcIjpcclxuXHRcdFx0XHRQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA9IGV2ZW50LmRldGFpbC5kZWFkbGluZTtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiY291bnQtZG93blwiOlxyXG5cdFx0XHRcdFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID0gZXZlbnQuZGV0YWlsLnRpbWU7XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5fdGltZXJQYXVzZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fc3RhdGUudGltZXJTdGF0ZVNldChldmVudC5kZXRhaWwudHlwZSArIFwiLXBhdXNlZFwiKTtcclxuXHRcdHRoYXQuX3Nob3dUaW1lT25Qcm9tcHRlcihldmVudClcclxuXHR9XHJcblx0dGhpcy5fdGltZXJSdW4gPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fc3RhdGUudGltZXJTdGF0ZVNldChldmVudC5kZXRhaWwudHlwZSk7XHJcblx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpXHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyQ2FuY2VsbGVkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuX3N0YXRlLnRpbWVyU3RhdGVTZXQoXCJuby10aW1lclwiKTtcclxuXHRcdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiR0aW1lT25Qcm9tcHRlci50ZXh0Q29udGVudFxyXG5cdFx0XHQ9IFByb21wdGVyLiRzaG93VGltZUxlZnQudGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cdCAgICBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS52YWx1ZSA9IFwiXCI7XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVPdmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuX3N0YXRlLnRpbWVyU3RhdGVTZXQoZXZlbnQuZGV0YWlsLnR5cGUgKyBcIi1vdmVyXCIpO1xyXG5cdFx0dGhhdC5fc2hvd1RpbWVPblByb21wdGVyKGV2ZW50KVxyXG5cdH1cclxuXHR0aGlzLl9vcGVuUHJvbXB0ZXJXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHQgICAgdmFyIHN0cldpbmRvd0ZlYXR1cmVzID0gXCJtZW51YmFyPW5vLCBsb2NhdGlvbj1ubywgbG9jYXRpb25iYXI9bm9cIjtcclxuXHRcdHN0cldpbmRvd0ZlYXR1cmVzICs9IFwidG9vbGJhcj1ubywgcGVyc29uYWxiYXI9bm8sIHN0YXR1cz1ub1wiO1xyXG5cdFx0c3RyV2luZG93RmVhdHVyZXMgKz0gXCJyZXNpemFibGU9eWVzLCBzY3JvbGxiYXJzPW5vLHN0YXR1cz1ub1wiO1xyXG5cdCAgICB2YXIgc3RyV2luZG93UG9zaXRpb25BbmRTaXplID0gXCJoZWlnaHQ9MzAwLHdpZHRoPTUwMFwiO1xyXG5cdCAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdyA9IHdpbmRvdy5vcGVuKFwicHJvbXB0ZXIuaHRtbFwiLCBcInByb21wdGVyXCJcclxuXHRcdFx0LCBzdHJXaW5kb3dQb3NpdGlvbkFuZFNpemUgKyBcIixcIiArIHN0cldpbmRvd0ZlYXR1cmVzKTtcclxuXHQgICAgaWYoIXRoYXQuX3Byb21wdGVyV2luZG93KSByZXR1cm47XHJcblx0ICAgIHRoYXQuX3Byb21wdGVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcblx0ICAgICAgICB3aW5kb3cuUHJvbXB0ZXIuVmlldy4kdGltZU9uUHJvbXB0ZXJcclxuXHRcdFx0XHQ9IHRoYXQuX3Byb21wdGVyV2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjdGltZV9sZWZ0XCIpO1xyXG5cdCAgICAgICAgd2luZG93LlByb21wdGVyLlZpZXcuJG1lc3NhZ2VPblByb21wdGVyXHJcblx0XHRcdFx0PSB0aGF0Ll9wcm9tcHRlcldpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I21lc3NhZ2Vfc2hvd1wiKTtcclxuXHQgICAgICAgIHRoYXQuX3N0YXRlLnByb21wdGVyU3RhdGVTZXQoXCJwcm9tcHRlci1vblwiKTtcclxuXHQgICAgICAgIHRoYXQuX3Nob3dNZXNzYWdlKCk7XHJcblx0XHQgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHRoYXQuX3Byb21wdGVyV2luZG93Q2xvc2VGdW5jKTtcclxuXHQgICAgICAgIHRoYXQuX3Byb21wdGVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHRoYXQuX2Nsb3NlUHJvbXB0ZXJXaW5kb3cpO1xyXG5cdCAgICAgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhhdC5jdXRDb250ZW50VG9GaXQpO1xyXG5cdCAgICB9KTtcclxuXHR9XHJcblx0dGhpcy5fY2xvc2VQcm9tcHRlcldpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdCAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fcHJvbXB0ZXJXaW5kb3dDbG9zZUZ1bmMpO1xyXG5cdCAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd1bmxvYWQnLCB0aGF0Ll9jbG9zZVByb21wdGVyV2luZG93KTtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhhdC5fc2hvd01lc3NhZ2UpO1xyXG5cdCAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5jbG9zZSgpO1xyXG5cdFx0dGhhdC5fcHJvbXB0ZXJXaW5kb3cgPSBudWxsO1xyXG5cdFx0d2luZG93LlByb21wdGVyLlZpZXcuJHRpbWVPblByb21wdGVyID0gbnVsbDtcclxuXHRcdHdpbmRvdy5Qcm9tcHRlci5WaWV3LiRtZXNzYWdlT25Qcm9tcHRlciA9IG51bGw7XHJcblx0ICAgIHRoYXQuX3N0YXRlLnByb21wdGVyU3RhdGVTZXQoXCJwcm9tcHRlci1vZmZcIik7XHJcblx0fVxyXG5cdHRoaXMuX3Byb21wdGVyV2luZG93T25PZmYgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll9zdGF0ZS5fcHJvbXB0ZXJTdGF0ZSA9PT0gXCJwcm9tcHRlci1vblwiKSB0aGF0Ll9jbG9zZVByb21wdGVyV2luZG93KCk7XHJcblx0ICAgIGVsc2UgdGhhdC5fb3BlblByb21wdGVyV2luZG93KCk7XHJcblx0fVxyXG5cdHRoaXMuX3Byb21wdGVyV2luZG93Q2xvc2VGdW5jID0gZnVuY3Rpb24gKCkge1xyXG5cdCAgICBpZiAodGhhdC5fc3RhdGUuX3Byb21wdGVyU3RhdGUgPT09IFwicHJvbXB0ZXItb25cIikgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdygpO1xyXG5cdH1cclxuXHR0aGlzLl9zaG93VGltZU9uUHJvbXB0ZXIgPSBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZiAodGhhdC5fc3RhdGUuX3Byb21wdGVyU3RhdGUgPT09IFwicHJvbXB0ZXItb25cIikge1xyXG5cdFx0XHR2YXIgZm9udCA9IGZvbnRGb3JtYXQoZXZlbnQpO1xyXG4gICAgICAgICAgICB3aW5kb3cuUHJvbXB0ZXIuVmlldy4kdGltZU9uUHJvbXB0ZXIuc3R5bGVbJ2ZvbnQtc2l6ZSddID0gZm9udC5zaXplO1xyXG5cdFx0XHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kdGltZU9uUHJvbXB0ZXIuc3R5bGUuY29sb3JcclxuXHRcdFx0XHQ9IFByb21wdGVyLiRzaG93VGltZUxlZnQuc3R5bGUuY29sb3IgPSBmb250LmNvbG9yO1xyXG5cdFx0XHR3aW5kb3cuUHJvbXB0ZXIuVmlldy4kdGltZU9uUHJvbXB0ZXIudGV4dENvbnRlbnRcclxuXHRcdFx0XHQ9IFByb21wdGVyLiRzaG93VGltZUxlZnQudGV4dENvbnRlbnQgPSBldmVudC5kZXRhaWwudGltZTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR0aGF0Ll9vcGVuUHJvbXB0ZXJXaW5kb3coKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuXHQgICAgdmFyIGlucHV0ID0gcGFyc2VJbnB1dCgpO1xyXG5cdCAgICBpZiAoaW5wdXQuaXNWYWxpZCkgUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgPSB0b1N0cihpbnB1dC52YWx1ZSk7XHJcblx0fSk7XHJcblx0dGhpcy5fJHByb21wdGVyV2luZG93QnV0dG9uT25PZmYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGF0Ll9wcm9tcHRlcldpbmRvd09uT2ZmKTtcclxuXHRQcm9tcHRlci4kaW5wdXRNZXNzYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoYXQuX3Byb2Nlc3NLZXlEb3duKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lclN0YXJ0ZWQnLCB0aGF0Ll90aW1lclN0YXJ0ZWQpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyQ2hhbmdlZCcsIHRoYXQuX3Nob3dUaW1lT25Qcm9tcHRlcik7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJQYXVzZWQnLCB0aGF0Ll90aW1lclBhdXNlZCk7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJSdW4nLCB0aGF0Ll90aW1lclJ1bik7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJDYW5jZWxsZWQnLCB0aGF0Ll90aW1lckNhbmNlbGxlZCk7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZU92ZXInLCB0aGF0Ll90aW1lT3Zlcik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlldzsiXX0=
