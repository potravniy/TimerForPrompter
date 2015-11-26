(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Timer = require('./model.js');
var parseInput = require('./parseInput.js');

var Controller = function () {
	var that = this;
	this._timer = null;
	this._buttonClickProcessing = function (event) {
		var input = parseInput();
		if(!input.isValid) throw "Wrong input.";
		switch (event.srcElement) {
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
},{"./model.js":7,"./parseInput.js":9}],2:[function(require,module,exports){
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
module.exports = function (eventName, customEventInit) {
    var evnt = new CustomEvent(eventName, customEventInit);
    Prompter.$body.dispatchEvent(evnt);
}
},{}],4:[function(require,module,exports){
var parseInput = require('./parseInput.js');

module.exports = function (event) {
	var fontColor = undefined;
	var timeInSeconds = parseInput(event.detail.time).value;
	if(event.detail.type === "countUp" || timeInSeconds > 119){
		fontColor = "";
	} else if (timeInSeconds > 59) {
		fontColor = "orange";
	} else {
		fontColor = "red";
	}
	return fontColor;
}

},{"./parseInput.js":9}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"./controller.js":1,"./secondsEventEmitter.js":10,"./view.js":11}],7:[function(require,module,exports){
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
},{"./convertTimeFromSecondsToString.js":2,"./emitEvent":3}],8:[function(require,module,exports){
module.exports = function(that) {
    var strWindowFeatures = "menubar=no, location=no, locationbar=no, toolbar=no, personalbar=no, status=no, resizable=yes, scrollbars=no,status=no";
    var strWindowPositionAndSize = "height=300,width=300";
    that._prompterWindow = window.open("prompter.html", "prompter", strWindowPositionAndSize + "," + strWindowFeatures);
    if(!that._prompterWindow) return;

    that._prompterWindow.addEventListener('load', function () {

        that._$timeOnPrompter = that._prompterWindow.document.querySelector("div#time_left");
        that._$messageOnPrompter = that._prompterWindow.document.querySelector("div#message_show");
        that._$prompterWindowButtonOnOff.innerHTML = "Закрыть<br>второе<br>окно";
        that._showMessage();

	    window.addEventListener('unload', that._prompterWindowCloseFunc);
        that._prompterWindow.addEventListener('unload', that._closePrompterWindow);

        var mainScreenWidth = window.screen.width;
        var count = 0;
        var isWindowFit = false;
        var xOld = that._prompterWindow.screenLeft;
        var yOld = that._prompterWindow.screenTop;
        var intervalID = setInterval(autoFitWindow, 150);
        function autoFitWindow() {
			if    (that._prompterWindow.document.fullscreenElement 
				|| that._prompterWindow.document.webkitFullscreenElement 
				|| that._prompterWindow.document.mozFullScreenElement 
				|| that._prompterWindow.document.msFullscreenElement) {
	        	that._prompterWindow.removeEventListener('drop', autoFitWindow);
	        	clearInterval(intervalID);
		    }
   	        var xNew = that._prompterWindow.screenLeft;
	        var yNew = that._prompterWindow.screenTop;
        	var isWinowMoving = (((xNew - xOld) * (xNew - xOld) + (yNew - yOld) * (yNew - yOld)) > 0);
        	xOld = xNew;
        	yOld = yNew;
        	var isWindowOn2ndMonitorRight = (that._prompterWindow.screenLeft >= mainScreenWidth);
            if (!isWinowMoving && isWindowOn2ndMonitorRight) {
                that._prompterWindow.moveTo(mainScreenWidth, 0);
                that._prompterWindow.resizeTo(that._prompterWindow.screen.availWidth, that._prompterWindow.screen.availHeight);
                isWindowFit = (that._prompterWindow.outerWidth > 400);
                if (isWindowFit) {
                	count++
			        if (count > 2) {
			        	that._prompterWindow.removeEventListener('drop', autoFitWindow);
			        	clearInterval(intervalID);
                	return
					}
                } else count = 0;
            }
        }
    });
}
},{}],9:[function(require,module,exports){
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


},{"./emitEvent":3}],11:[function(require,module,exports){
var parseInput = require('./parseInput');
var toStr = require('./convertTimeFromSecondsToString.js');
var fontSize = require("./fontSize.js");
var fontColor = require("./fontColor.js");
var openPrompterWindow = require("./openPrompterWindowModule.js");

var View = function () {
	var that = this;
	this._prompterWindow = undefined;
	this._$timeOnPrompter = null;
	this._$messageOnPrompter = null;
	this._$prompterWindowButtonOnOff = document.querySelector("button#screen2");

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
	    	that._openPrompterWindow(that);
	    	Prompter.$showMessage.textContent = "Нет окна суфлера";
	    }
	}
	this._showMessage = function () {
	        that._$messageOnPrompter.textContent = Prompter.$showMessage.textContent = Prompter.$inputMessage.value;
	        Prompter.$inputMessage.value = "";
	}
	this._timerStarted = function(event) {
		Prompter.$inputAndDisplayTime.value = event.detail.time;
		switch (event.detail.type) {
			case "countUp":
				Prompter.$buttonCountUp.style["background-color"] = "#0f0";
				Prompter.$buttonCountUp.innerHTML = "Прямой отсчет<br>пауза";
				that._showTimeOnPrompter(event);
				break
			case "countDown":
				Prompter.$buttonCountDown.style["background-color"] = "#0f0";
				Prompter.$buttonCountDown.innerHTML = "Обратный отсчет<br>пауза";
				that._showTimeOnPrompter(event);
				break
			case "deadline":
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
	this._openPrompterWindow = openPrompterWindow;
	this._closePrompterWindow = function() {
	    window.removeEventListener('unload', that._prompterWindowCloseFunc);
        that._prompterWindow.removeEventListener('unload', that._closePrompterWindow);
	    that._prompterWindow.close();
		this._prompterWindow = undefined;
		this._$timeOnPrompter = null;
		this._$messageOnPrompter = null;
    	that._$prompterWindowButtonOnOff.innerHTML = "Создать<br>второе<br>окно";
	}
	this._prompterWindowOnOff = function () {
	    if (that._prompterWindow) that._closePrompterWindow();
	    else that._openPrompterWindow(that);
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
			Prompter.$showTimeLeft.textContent = "Нет окна суфлера";
			that._openPrompterWindow(that);
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
},{"./convertTimeFromSecondsToString.js":2,"./fontColor.js":4,"./fontSize.js":5,"./openPrompterWindowModule.js":8,"./parseInput":9}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb250cm9sbGVyLmpzIiwianMvY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzIiwianMvZW1pdEV2ZW50LmpzIiwianMvZm9udENvbG9yLmpzIiwianMvZm9udFNpemUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kZWwuanMiLCJqcy9vcGVuUHJvbXB0ZXJXaW5kb3dNb2R1bGUuanMiLCJqcy9wYXJzZUlucHV0LmpzIiwianMvc2Vjb25kc0V2ZW50RW1pdHRlci5qcyIsImpzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRpbWVyID0gcmVxdWlyZSgnLi9tb2RlbC5qcycpO1xyXG52YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG5cclxudmFyIENvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XHJcblx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdHRoaXMuX3RpbWVyID0gbnVsbDtcclxuXHR0aGlzLl9idXR0b25DbGlja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdHZhciBpbnB1dCA9IHBhcnNlSW5wdXQoKTtcclxuXHRcdGlmKCFpbnB1dC5pc1ZhbGlkKSB0aHJvdyBcIldyb25nIGlucHV0LlwiO1xyXG5cdFx0c3dpdGNoIChldmVudC5zcmNFbGVtZW50KSB7XHJcblx0XHRcdGNhc2UgUHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAgOlxyXG5cdFx0XHRcdGlmKCF0aGF0Ll90aW1lcil7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lciA9IG5ldyBUaW1lcihcImNvdW50VXBcIiwgaW5wdXQudmFsdWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJjb3VudFVwXCIgJiYgIXRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucGF1c2UoKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwiY291bnRVcFwiICYmIHRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucnVuKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgUHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93biA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiY291bnREb3duXCIsIGlucHV0LnZhbHVlKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwiY291bnREb3duXCIgJiYgIXRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucGF1c2UoKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwiY291bnREb3duXCIgJiYgdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5ydW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSBQcm9tcHRlci4kYnV0dG9uQ291bnREZWFkbGluZSA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiZGVhZGxpbmVcIiwgaW5wdXQudmFsdWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFByb21wdGVyLiRidXR0b25SZXNldCA6XHJcblx0XHRcdFx0aWYgKHRoYXQuX3RpbWVyKSB0aGF0Ll90aW1lci5jYW5jZWwoKTtcclxuXHRcdFx0XHR0aGF0Ll90aW1lciA9IG51bGw7XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoYXQuX2J1dHRvbkNsaWNrUHJvY2Vzc2luZyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0aW1lSW5TZWNvbmRzLCBmdWxsRm9ybWF0KSB7XHJcbiAgICB2YXIgaCA9IE1hdGguZmxvb3IodGltZUluU2Vjb25kcyAvICgzNjAwKSk7XHJcbiAgICB2YXIgbSA9IE1hdGguZmxvb3IoKHRpbWVJblNlY29uZHMgLSBoICogMzYwMCkgLyA2MCk7XHJcbiAgICB2YXIgcyA9IE1hdGguZmxvb3IodGltZUluU2Vjb25kcyAtIGggKiAzNjAwIC0gbSAqIDYwKTtcclxuICAgIHZhciB0aW1lU3RyaW5nID0gXCI6XCIgKyAocyA8IDEwID8gXCIwXCIgKyBzIDogcyk7XHJcbiAgICBpZihmdWxsRm9ybWF0KXtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKGggPCAxMCA/IFwiMFwiICsgaCA6IGgpICsgXCI6XCIgKyAobSA8IDEwID8gXCIwXCIgKyBtIDogbSkgKyB0aW1lU3RyaW5nO1xyXG4gICAgfWVsc2Uge1xyXG4gICAgICAgIGlmIChoID4gMCkge1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gaCArIFwiOlwiICsgKG0gPCAxMCA/IFwiMFwiICsgbSA6IG0pICsgdGltZVN0cmluZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gbSArIHRpbWVTdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWVTdHJpbmc7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBjdXN0b21FdmVudEluaXQpIHtcclxuICAgIHZhciBldm50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgY3VzdG9tRXZlbnRJbml0KTtcclxuICAgIFByb21wdGVyLiRib2R5LmRpc3BhdGNoRXZlbnQoZXZudCk7XHJcbn0iLCJ2YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHR2YXIgZm9udENvbG9yID0gdW5kZWZpbmVkO1xyXG5cdHZhciB0aW1lSW5TZWNvbmRzID0gcGFyc2VJbnB1dChldmVudC5kZXRhaWwudGltZSkudmFsdWU7XHJcblx0aWYoZXZlbnQuZGV0YWlsLnR5cGUgPT09IFwiY291bnRVcFwiIHx8IHRpbWVJblNlY29uZHMgPiAxMTkpe1xyXG5cdFx0Zm9udENvbG9yID0gXCJcIjtcclxuXHR9IGVsc2UgaWYgKHRpbWVJblNlY29uZHMgPiA1OSkge1xyXG5cdFx0Zm9udENvbG9yID0gXCJvcmFuZ2VcIjtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Zm9udENvbG9yID0gXCJyZWRcIjtcclxuXHR9XHJcblx0cmV0dXJuIGZvbnRDb2xvcjtcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgdmFyIGZvbnRTaXplID0gdW5kZWZpbmVkO1xyXG4gICAgdmFyIG1pbkZvbnRTaXplID0gMjM7XHJcbiAgICB2YXIgbWF4Rm9udFNpemUgPSA0MDtcclxuICAgIHZhciBtaW5TdHJpbmdMZW5ndGggPSA0O1xyXG4gICAgdmFyIG1heFN0cmluZ0xlbmd0aCA9IDg7XHJcbiAgICBmb250U2l6ZSA9IE1hdGguZmxvb3IobWluRm9udFNpemUgXHJcbiAgICBcdCsgKG1heFN0cmluZ0xlbmd0aCAtIGV2ZW50LmRldGFpbC50aW1lLmxlbmd0aCkgKiAobWF4Rm9udFNpemUgLSBtaW5Gb250U2l6ZSkgLyAobWF4U3RyaW5nTGVuZ3RoIC0gbWluU3RyaW5nTGVuZ3RoKSk7XHJcblx0cmV0dXJuIGZvbnRTaXplO1xyXG59Iiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vY29udHJvbGxlci5qcycpO1xyXG5cdHZhciBWaWV3ID0gcmVxdWlyZShcIi4vdmlldy5qc1wiKTtcclxuICAgIHdpbmRvdy5Qcm9tcHRlciA9IHtcclxuICAgICAgICAkYm9keTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIiksXHJcbiAgICAgICAgJGJ1dHRvbkNvdW50VXA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jdXBcIiksXHJcbiAgICAgICAgJGJ1dHRvbkNvdW50RG93bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNkb3duXCIpLFxyXG4gICAgICAgICRpbnB1dEFuZERpc3BsYXlUaW1lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXQjdGltZVwiKSxcclxuICAgICAgICAkYnV0dG9uQ291bnREZWFkbGluZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNkZWFkbGluZV9zdGFydFwiKSxcclxuICAgICAgICAkYnV0dG9uUmVzZXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jcmVzZXRcIiksXHJcbiAgICAgICAgJGlucHV0TWVzc2FnZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInRleHRhcmVhI21lc3NhZ2VcIiksXHJcbiAgICAgICAgJHNob3dUaW1lTGVmdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aW1lX2xlZnRcIiksXHJcbiAgICAgICAgJHNob3dNZXNzYWdlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I21lc3NhZ2Vfc2hvd1wiKVxyXG4gICAgfVxyXG4gICAgcmVxdWlyZSgnLi9zZWNvbmRzRXZlbnRFbWl0dGVyLmpzJyk7XHJcbiAgICB2YXIgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XHJcbiAgICB2YXIgdmlldyA9IG5ldyBWaWV3KCk7XHJcbn0iLCJ2YXIgY29udmVydFRvU3RyaW5nID0gcmVxdWlyZShcIi4vY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzXCIpO1xuXG52YXIgVGltZXIgPSBmdW5jdGlvbiAodHlwZU9mVGltZXIsIGVudGVyZWRUaW1lSW5TZWNvbmRzKSB7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dGhpcy50aW1lclZhbHVlID0gZW50ZXJlZFRpbWVJblNlY29uZHM7XG5cdHRoaXMuZW1pdCA9IHJlcXVpcmUoXCIuL2VtaXRFdmVudFwiKTtcblx0dGhpcy50eXBlID0gdHlwZU9mVGltZXI7XG5cdHN3aXRjaCAodHlwZU9mVGltZXIpe1xuXHRcdGNhc2UgXCJjb3VudFVwXCI6XG5cdFx0XHR0aGlzLmNvdW50VXAgPSBmdW5jdGlvbiAoKXtcblx0XHRcdFx0dGhhdC50aW1lclZhbHVlKys7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJDaGFuZ2VkJywgY3VzdG9tRXZlbnRJbml0KHRoYXQudGltZXJWYWx1ZSkpO1xuXHRcdFx0fTtcblx0XHRcdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQuY291bnRVcCk7XG5cdFx0XHR0aGlzLnBhdXNlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC5jb3VudFVwKTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSB0cnVlO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUGF1c2VkJywgY3VzdG9tRXZlbnRJbml0KHRoYXQudGltZXJWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ydW4gPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LmNvdW50VXApO1xuXHRcdFx0XHR0aGF0LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUnVuJywgY3VzdG9tRXZlbnRJbml0KHRoYXQudGltZXJWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jYW5jZWwgPSBmdW5jdGlvbigpe1xuXHRcdFx0XHRQcm9tcHRlci4kYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LmNvdW50VXApO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2FuY2VsbGVkJywge2RldGFpbDoge3R5cGU6IFwiY291bnRVcFwifX0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lbWl0KCd0aW1lclN0YXJ0ZWQnLCBjdXN0b21FdmVudEluaXQodGhhdC50aW1lclZhbHVlKSk7XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgXCJjb3VudERvd25cIjpcblx0XHRcdHRoaXMuY291bnREb3duID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZS0tO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbUV2ZW50SW5pdCh0aGF0LnRpbWVyVmFsdWUpKTtcblx0XHRcdFx0aWYodGhhdC50aW1lclZhbHVlID09PSAwKSB7XG5cdFx0XHRcdFx0dGhhdC5wYXVzZSgpO1xuXHRcdFx0XHRcdHRoYXQuZW1pdCgndGltZU92ZXInLCBjdXN0b21FdmVudEluaXQodGhhdC50aW1lclZhbHVlKSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LmNvdW50RG93bik7XG5cdFx0XHR0aGlzLnBhdXNlID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC5jb3VudERvd24pO1xuXHRcdFx0XHR0aGF0LnBhdXNlZCA9IHRydWU7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJQYXVzZWQnLCBjdXN0b21FdmVudEluaXQodGhhdC50aW1lclZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQuY291bnREb3duKTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclJ1bicsIGN1c3RvbUV2ZW50SW5pdCh0aGF0LnRpbWVyVmFsdWUpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuY2FuY2VsID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC5jb3VudERvd24pO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2FuY2VsbGVkJywgY3VzdG9tRXZlbnRJbml0KHRoYXQudGltZXJWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5lbWl0KCd0aW1lclN0YXJ0ZWQnLCBjdXN0b21FdmVudEluaXQodGhhdC50aW1lclZhbHVlKSk7XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgXCJkZWFkbGluZVwiOlxuXHRcdFx0dmFyIGVudGVyZWRUaW1lID0gY29udmVydFRvU3RyaW5nKGVudGVyZWRUaW1lSW5TZWNvbmRzLCB0cnVlKTtcblx0XHRcdHZhciBldmVudEluaXQgPSB7XG5cdFx0XHRcdGRldGFpbDoge1xuXHRcdFx0XHRcdHR5cGU6IHR5cGVPZlRpbWVyLFxuXHRcdFx0XHRcdHRpbWU6IGVudGVyZWRUaW1lXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuZW1pdCgndGltZXJTdGFydGVkJywgZXZlbnRJbml0KTtcblx0XHRcdHRoaXMudGltZXJWYWx1ZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUuc2V0SG91cnMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygwLCAyKSk7XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUuc2V0TWludXRlcygrZW50ZXJlZFRpbWUuc3Vic3RyaW5nKDMsIDUpKTtcblx0XHRcdHRoaXMudGltZXJWYWx1ZS5zZXRTZWNvbmRzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoNikpO1xuXHRcdFx0aWYgKHRoaXMudGltZXJWYWx1ZSA8IG5ldyBEYXRlKCkpIHtcblx0XHRcdFx0dGhpcy50aW1lclZhbHVlLnNldERhdGUodGhpcy50aW1lclZhbHVlLmdldERhdGUoKSArIDEpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc29sZS5sb2coXCJ0aGlzLnRpbWVyVmFsdWU6IFwiICsgdGhpcy50aW1lclZhbHVlICsgXCIsIG5ldyBEYXRlKCk6IFwiICsgKG5ldyBEYXRlKCkpKTtcblx0XHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBsZWZ0U2Vjb25kcyA9IE1hdGguZmxvb3IoKHRoYXQudGltZXJWYWx1ZSAtIG5ldyBEYXRlKCkpIC8gMTAwMCk7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJDaGFuZ2VkJywgY3VzdG9tRXZlbnRJbml0KGxlZnRTZWNvbmRzKSk7XG5cdFx0XHRcdGlmIChsZWZ0U2Vjb25kcyA9PT0gMCl7XG5cdFx0XHRcdFx0UHJvbXB0ZXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lT3ZlcicsIGN1c3RvbUV2ZW50SW5pdChsZWZ0U2Vjb25kcykpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHR0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFByb21wdGVyLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2FuY2VsbGVkJywgY3VzdG9tRXZlbnRJbml0KHRoYXQudGltZXJWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWtcblx0fVxuXHRmdW5jdGlvbiBjdXN0b21FdmVudEluaXQodGltZSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRkZXRhaWw6IHtcblx0XHRcdFx0dHlwZTogdHlwZU9mVGltZXIsXG5cdFx0XHRcdHRpbWU6IGNvbnZlcnRUb1N0cmluZyh0aW1lKVxuXHRcdFx0fVxuXHRcdH1cdFxuXHR9IFxuXHRyZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRoYXQpIHtcclxuICAgIHZhciBzdHJXaW5kb3dGZWF0dXJlcyA9IFwibWVudWJhcj1ubywgbG9jYXRpb249bm8sIGxvY2F0aW9uYmFyPW5vLCB0b29sYmFyPW5vLCBwZXJzb25hbGJhcj1ubywgc3RhdHVzPW5vLCByZXNpemFibGU9eWVzLCBzY3JvbGxiYXJzPW5vLHN0YXR1cz1ub1wiO1xyXG4gICAgdmFyIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSA9IFwiaGVpZ2h0PTMwMCx3aWR0aD0zMDBcIjtcclxuICAgIHRoYXQuX3Byb21wdGVyV2luZG93ID0gd2luZG93Lm9wZW4oXCJwcm9tcHRlci5odG1sXCIsIFwicHJvbXB0ZXJcIiwgc3RyV2luZG93UG9zaXRpb25BbmRTaXplICsgXCIsXCIgKyBzdHJXaW5kb3dGZWF0dXJlcyk7XHJcbiAgICBpZighdGhhdC5fcHJvbXB0ZXJXaW5kb3cpIHJldHVybjtcclxuXHJcbiAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGF0Ll8kdGltZU9uUHJvbXB0ZXIgPSB0aGF0Ll9wcm9tcHRlcldpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I3RpbWVfbGVmdFwiKTtcclxuICAgICAgICB0aGF0Ll8kbWVzc2FnZU9uUHJvbXB0ZXIgPSB0aGF0Ll9wcm9tcHRlcldpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I21lc3NhZ2Vfc2hvd1wiKTtcclxuICAgICAgICB0aGF0Ll8kcHJvbXB0ZXJXaW5kb3dCdXR0b25Pbk9mZi5pbm5lckhUTUwgPSBcItCX0LDQutGA0YvRgtGMPGJyPtCy0YLQvtGA0L7QtTxicj7QvtC60L3QvlwiO1xyXG4gICAgICAgIHRoYXQuX3Nob3dNZXNzYWdlKCk7XHJcblxyXG5cdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fcHJvbXB0ZXJXaW5kb3dDbG9zZUZ1bmMpO1xyXG4gICAgICAgIHRoYXQuX3Byb21wdGVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHRoYXQuX2Nsb3NlUHJvbXB0ZXJXaW5kb3cpO1xyXG5cclxuICAgICAgICB2YXIgbWFpblNjcmVlbldpZHRoID0gd2luZG93LnNjcmVlbi53aWR0aDtcclxuICAgICAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgICAgIHZhciBpc1dpbmRvd0ZpdCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB4T2xkID0gdGhhdC5fcHJvbXB0ZXJXaW5kb3cuc2NyZWVuTGVmdDtcclxuICAgICAgICB2YXIgeU9sZCA9IHRoYXQuX3Byb21wdGVyV2luZG93LnNjcmVlblRvcDtcclxuICAgICAgICB2YXIgaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGF1dG9GaXRXaW5kb3csIDE1MCk7XHJcbiAgICAgICAgZnVuY3Rpb24gYXV0b0ZpdFdpbmRvdygpIHtcclxuXHRcdFx0aWYgICAgKHRoYXQuX3Byb21wdGVyV2luZG93LmRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IFxyXG5cdFx0XHRcdHx8IHRoYXQuX3Byb21wdGVyV2luZG93LmRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IFxyXG5cdFx0XHRcdHx8IHRoYXQuX3Byb21wdGVyV2luZG93LmRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbGVtZW50IFxyXG5cdFx0XHRcdHx8IHRoYXQuX3Byb21wdGVyV2luZG93LmRvY3VtZW50Lm1zRnVsbHNjcmVlbkVsZW1lbnQpIHtcclxuXHQgICAgICAgIFx0dGhhdC5fcHJvbXB0ZXJXaW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIGF1dG9GaXRXaW5kb3cpO1xyXG5cdCAgICAgICAgXHRjbGVhckludGVydmFsKGludGVydmFsSUQpO1xyXG5cdFx0ICAgIH1cclxuICAgXHQgICAgICAgIHZhciB4TmV3ID0gdGhhdC5fcHJvbXB0ZXJXaW5kb3cuc2NyZWVuTGVmdDtcclxuXHQgICAgICAgIHZhciB5TmV3ID0gdGhhdC5fcHJvbXB0ZXJXaW5kb3cuc2NyZWVuVG9wO1xyXG4gICAgICAgIFx0dmFyIGlzV2lub3dNb3ZpbmcgPSAoKCh4TmV3IC0geE9sZCkgKiAoeE5ldyAtIHhPbGQpICsgKHlOZXcgLSB5T2xkKSAqICh5TmV3IC0geU9sZCkpID4gMCk7XHJcbiAgICAgICAgXHR4T2xkID0geE5ldztcclxuICAgICAgICBcdHlPbGQgPSB5TmV3O1xyXG4gICAgICAgIFx0dmFyIGlzV2luZG93T24ybmRNb25pdG9yUmlnaHQgPSAodGhhdC5fcHJvbXB0ZXJXaW5kb3cuc2NyZWVuTGVmdCA+PSBtYWluU2NyZWVuV2lkdGgpO1xyXG4gICAgICAgICAgICBpZiAoIWlzV2lub3dNb3ZpbmcgJiYgaXNXaW5kb3dPbjJuZE1vbml0b3JSaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cubW92ZVRvKG1haW5TY3JlZW5XaWR0aCwgMCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5yZXNpemVUbyh0aGF0Ll9wcm9tcHRlcldpbmRvdy5zY3JlZW4uYXZhaWxXaWR0aCwgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuc2NyZWVuLmF2YWlsSGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGlzV2luZG93Rml0ID0gKHRoYXQuX3Byb21wdGVyV2luZG93Lm91dGVyV2lkdGggPiA0MDApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzV2luZG93Rml0KSB7XHJcbiAgICAgICAgICAgICAgICBcdGNvdW50KytcclxuXHRcdFx0ICAgICAgICBpZiAoY291bnQgPiAyKSB7XHJcblx0XHRcdCAgICAgICAgXHR0aGF0Ll9wcm9tcHRlcldpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgYXV0b0ZpdFdpbmRvdyk7XHJcblx0XHRcdCAgICAgICAgXHRjbGVhckludGVydmFsKGludGVydmFsSUQpO1xyXG4gICAgICAgICAgICAgICAgXHRyZXR1cm5cclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBjb3VudCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpbWVTdHJpbmcpIHtcclxuICAgIGlmKCF0aW1lU3RyaW5nKXtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID8gUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgOiAwKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IE5hTixcclxuICAgICAgICBpc1ZhbGlkOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKHRpbWVTdHJpbmcpKSB7XHJcbiAgICAgICAgdmFyIHZhbGlkQ2hhcnMgPSBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgXCI6XCJdO1xyXG4gICAgICAgIHZhciB0aW1lTnVtYmVyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbWVTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlzQ2hhclZhbGlkID0gdmFsaWRDaGFycy5zb21lKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZVN0cmluZ1tpXSA9PSBpdGVtO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpZiAoIWlzQ2hhclZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcItCU0L7Qv9GD0YHRgtC40LzQviDQstCy0L7QtNC40YLRjCDRgtC+0LvRjNC60L4g0YbQuNGE0YDRiyDQuCDQtNCy0L7QtdGC0L7Rh9C40Y8uXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aW1lU3RyaW5nW2ldICE9PSBcIjpcIikgdGltZU51bWJlciA9IHRpbWVOdW1iZXIgKiAxMCArICgrdGltZVN0cmluZ1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHRpbWVOdW1iZXIgPSB0aW1lU3RyaW5nO1xyXG5cclxuICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZU51bWJlciAvIDEwMDAwKTtcclxuICAgIGlmIChob3VycyA+IDIzKSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfRh9Cw0YHQvtCyJyDQsdC+0LvRjNGI0LUgMjMuXCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigodGltZU51bWJlciAtIGhvdXJzICogMTAwMDApIC8gMTAwKTtcclxuICAgIGlmIChtaW51dGVzID4gNTkpIHtcclxuICAgICAgICBhbGVydChcItCX0L3QsNGH0LXQvdC40LUgJ9C80LjQvdGD0YInINCx0L7Qu9GM0YjQtSA1OS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKHRpbWVOdW1iZXIgLSBob3VycyAqIDEwMDAwIC0gbWludXRlcyAqIDEwMCk7XHJcbiAgICBpZiAoc2Vjb25kcyA+IDU5KSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfRgdC10LrRg9C90LQnINCx0L7Qu9GM0YjQtSA1OS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIHRpbWVJblNlY29uZHMgPSBob3VycyAqIDM2MDAgKyBtaW51dGVzICogNjAgKyBzZWNvbmRzO1xyXG4gICAgcmV0dXJuIHJlc3VsdCA9IHtcclxuICAgICAgICB2YWx1ZTogdGltZUluU2Vjb25kcyxcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9XHJcbn1cclxuIiwidmFyIGVtaXQgPSByZXF1aXJlKCcuL2VtaXRFdmVudCcpO1xyXG52YXIgY3VycmVudFRpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxudmFyIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbChlbWl0RXZlbnRFdmVyeVNlY29uZCwgMTAwKTtcclxuXHJcbmZ1bmN0aW9uIGVtaXRFdmVudEV2ZXJ5U2Vjb25kKCkge1xyXG4gICAgdmFyIG5ld1RpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIGlmIChjdXJyZW50VGltZUluU2Vjb25kcyAhPT0gbmV3VGltZUluU2Vjb25kcykge1xyXG4gICAgICAgIGN1cnJlbnRUaW1lSW5TZWNvbmRzID0gbmV3VGltZUluU2Vjb25kcztcclxuICAgICAgICBlbWl0KCduZXdTZWNvbmQnKTtcclxuICAgIH1cclxufVxyXG5cclxuIiwidmFyIHBhcnNlSW5wdXQgPSByZXF1aXJlKCcuL3BhcnNlSW5wdXQnKTtcclxudmFyIHRvU3RyID0gcmVxdWlyZSgnLi9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanMnKTtcclxudmFyIGZvbnRTaXplID0gcmVxdWlyZShcIi4vZm9udFNpemUuanNcIik7XHJcbnZhciBmb250Q29sb3IgPSByZXF1aXJlKFwiLi9mb250Q29sb3IuanNcIik7XHJcbnZhciBvcGVuUHJvbXB0ZXJXaW5kb3cgPSByZXF1aXJlKFwiLi9vcGVuUHJvbXB0ZXJXaW5kb3dNb2R1bGUuanNcIik7XHJcblxyXG52YXIgVmlldyA9IGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0dGhpcy5fcHJvbXB0ZXJXaW5kb3cgPSB1bmRlZmluZWQ7XHJcblx0dGhpcy5fJHRpbWVPblByb21wdGVyID0gbnVsbDtcclxuXHR0aGlzLl8kbWVzc2FnZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cdHRoaXMuXyRwcm9tcHRlcldpbmRvd0J1dHRvbk9uT2ZmID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNzY3JlZW4yXCIpO1xyXG5cclxuXHR0aGlzLl9wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdCAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuXHQgICAgICAgIHRoYXQuX3Byb2Nlc3NNZXNzYWdlKCk7XHJcblx0ICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDI3KSB7XHJcblx0ICAgICAgICBQcm9tcHRlci4kaW5wdXRNZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9wcm9jZXNzTWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuXHQgICAgaWYgKHRoYXQuXyRtZXNzYWdlT25Qcm9tcHRlcikge1xyXG5cdCAgICAgICAgdGhhdC5fc2hvd01lc3NhZ2UoKTtcclxuXHQgICAgfSBlbHNlIHtcclxuXHQgICAgXHR0aGF0Ll9vcGVuUHJvbXB0ZXJXaW5kb3codGhhdCk7XHJcblx0ICAgIFx0UHJvbXB0ZXIuJHNob3dNZXNzYWdlLnRleHRDb250ZW50ID0gXCLQndC10YIg0L7QutC90LAg0YHRg9GE0LvQtdGA0LBcIjtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9zaG93TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuXHQgICAgICAgIHRoYXQuXyRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudCA9IFByb21wdGVyLiRzaG93TWVzc2FnZS50ZXh0Q29udGVudCA9IFByb21wdGVyLiRpbnB1dE1lc3NhZ2UudmFsdWU7XHJcblx0ICAgICAgICBQcm9tcHRlci4kaW5wdXRNZXNzYWdlLnZhbHVlID0gXCJcIjtcclxuXHR9XHJcblx0dGhpcy5fdGltZXJTdGFydGVkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID0gZXZlbnQuZGV0YWlsLnRpbWU7XHJcblx0XHRzd2l0Y2ggKGV2ZW50LmRldGFpbC50eXBlKSB7XHJcblx0XHRcdGNhc2UgXCJjb3VudFVwXCI6XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCIjMGYwXCI7XHJcblx0XHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuaW5uZXJIVE1MID0gXCLQn9GA0Y/QvNC+0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0LDRg9C30LBcIjtcclxuXHRcdFx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJjb3VudERvd25cIjpcclxuXHRcdFx0XHRQcm9tcHRlci4kYnV0dG9uQ291bnREb3duLnN0eWxlW1wiYmFja2dyb3VuZC1jb2xvclwiXSA9IFwiIzBmMFwiO1xyXG5cdFx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERvd24uaW5uZXJIVE1MID0gXCLQntCx0YDQsNGC0L3Ri9C5INC+0YLRgdGH0LXRgjxicj7Qv9Cw0YPQt9CwXCI7XHJcblx0XHRcdFx0dGhhdC5fc2hvd1RpbWVPblByb21wdGVyKGV2ZW50KTtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlIFwiZGVhZGxpbmVcIjpcclxuXHRcdFx0XHRQcm9tcHRlci4kYnV0dG9uQ291bnREZWFkbGluZS5zdHlsZVtcImJhY2tncm91bmQtY29sb3JcIl0gPSBcIiMwZjBcIjtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLl90aW1lclBhdXNlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIoZXZlbnQpXHJcblx0XHRzd2l0Y2ggKGV2ZW50LmRldGFpbC50eXBlKSB7XHJcblx0XHRjYXNlIFwiY291bnRVcFwiOlxyXG5cdFx0XHRQcm9tcHRlci4kYnV0dG9uQ291bnRVcC5pbm5lckhUTUwgPSBcItCf0YDRj9C80L7QuSDQvtGC0YHRh9C10YI8YnI+0L/Rg9GB0LpcIjtcclxuXHRcdFx0YnJlYWtcclxuXHRcdGNhc2UgXCJjb3VudERvd25cIjpcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93bi5pbm5lckhUTUwgPSBcItCe0LHRgNCw0YLQvdGL0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0YPRgdC6XCI7XHJcblx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyUnVuID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuX3Nob3dUaW1lT25Qcm9tcHRlcihldmVudClcclxuXHRcdHN3aXRjaCAoZXZlbnQuZGV0YWlsLnR5cGUpIHtcclxuXHRcdGNhc2UgXCJjb3VudFVwXCI6XHJcblx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudFVwLmlubmVySFRNTCA9IFwi0J/RgNGP0LzQvtC5INC+0YLRgdGH0LXRgjxicj7Qv9Cw0YPQt9CwXCI7XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiY291bnREb3duXCI6XHJcblx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERvd24uaW5uZXJIVE1MID0gXCLQntCx0YDQsNGC0L3Ri9C5INC+0YLRgdGH0LXRgjxicj7Qv9Cw0YPQt9CwXCI7XHJcblx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyQ2FuY2VsbGVkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHRoYXQuXyR0aW1lT25Qcm9tcHRlci50ZXh0Q29udGVudCA9IFByb21wdGVyLiRzaG93VGltZUxlZnQudGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cdFx0dGhhdC5fJHRpbWVPblByb21wdGVyLnN0eWxlLmNvbG9yID0gUHJvbXB0ZXIuJHNob3dUaW1lTGVmdC5zdHlsZS5jb2xvciA9IFwiXCI7XHRcclxuXHQgICAgUHJvbXB0ZXIuJGlucHV0QW5kRGlzcGxheVRpbWUudmFsdWUgPSBcIlwiO1xyXG5cdCAgICBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS5zdHlsZVtcImJhY2tncm91bmQtY29sb3JcIl0gPSBcIlwiO1xyXG5cdFx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSkge1xyXG5cdFx0Y2FzZSBcImNvdW50VXBcIjpcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCJcIjtcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50VXAuaW5uZXJIVE1MID0gXCLQn9GA0Y/QvNC+0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0YPRgdC6XCI7XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiY291bnREb3duXCI6XHJcblx0XHRcdFByb21wdGVyLiRidXR0b25Db3VudERvd24uc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCJcIjtcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50RG93bi5pbm5lckhUTUwgPSBcItCe0LHRgNCw0YLQvdGL0Lkg0L7RgtGB0YfQtdGCPGJyPtC/0YPRgdC6XCI7XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiZGVhZGxpbmVcIjpcclxuXHRcdFx0UHJvbXB0ZXIuJGJ1dHRvbkNvdW50RGVhZGxpbmUuc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCJcIjtcclxuXHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5fdGltZU92ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0dGhhdC5fc2hvd1RpbWVPblByb21wdGVyKGV2ZW50KVxyXG5cdCAgICBQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS5zdHlsZVtcImJhY2tncm91bmQtY29sb3JcIl0gPSBcIiNmMDBcIjtcclxuXHR9XHJcblx0dGhpcy5fb3BlblByb21wdGVyV2luZG93ID0gb3BlblByb21wdGVyV2luZG93O1xyXG5cdHRoaXMuX2Nsb3NlUHJvbXB0ZXJXaW5kb3cgPSBmdW5jdGlvbigpIHtcclxuXHQgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHRoYXQuX3Byb21wdGVyV2luZG93Q2xvc2VGdW5jKTtcclxuICAgICAgICB0aGF0Ll9wcm9tcHRlcldpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd1bmxvYWQnLCB0aGF0Ll9jbG9zZVByb21wdGVyV2luZG93KTtcclxuXHQgICAgdGhhdC5fcHJvbXB0ZXJXaW5kb3cuY2xvc2UoKTtcclxuXHRcdHRoaXMuX3Byb21wdGVyV2luZG93ID0gdW5kZWZpbmVkO1xyXG5cdFx0dGhpcy5fJHRpbWVPblByb21wdGVyID0gbnVsbDtcclxuXHRcdHRoaXMuXyRtZXNzYWdlT25Qcm9tcHRlciA9IG51bGw7XHJcbiAgICBcdHRoYXQuXyRwcm9tcHRlcldpbmRvd0J1dHRvbk9uT2ZmLmlubmVySFRNTCA9IFwi0KHQvtC30LTQsNGC0Yw8YnI+0LLRgtC+0YDQvtC1PGJyPtC+0LrQvdC+XCI7XHJcblx0fVxyXG5cdHRoaXMuX3Byb21wdGVyV2luZG93T25PZmYgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll9wcm9tcHRlcldpbmRvdykgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdygpO1xyXG5cdCAgICBlbHNlIHRoYXQuX29wZW5Qcm9tcHRlcldpbmRvdyh0aGF0KTtcclxuXHR9XHJcblx0dGhpcy5fcHJvbXB0ZXJXaW5kb3dDbG9zZUZ1bmMgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh0aGF0Ll9wcm9tcHRlcldpbmRvdykgdGhhdC5fY2xvc2VQcm9tcHRlcldpbmRvdygpO1xyXG5cdH1cclxuXHR0aGlzLl9zaG93VGltZU9uUHJvbXB0ZXIgPSBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZiAodGhhdC5fJHRpbWVPblByb21wdGVyKSB7XHJcbiAgICAgICAgICAgIHRoYXQuXyR0aW1lT25Qcm9tcHRlci5zdHlsZVsnZm9udC1zaXplJ10gPSBmb250U2l6ZShldmVudCkgKyAndncnO1xyXG5cdFx0XHR0aGF0Ll8kdGltZU9uUHJvbXB0ZXIuc3R5bGUuY29sb3IgPSBQcm9tcHRlci4kc2hvd1RpbWVMZWZ0LnN0eWxlLmNvbG9yID0gZm9udENvbG9yKGV2ZW50KTtcclxuXHRcdFx0dGhhdC5fJHRpbWVPblByb21wdGVyLnRleHRDb250ZW50ID0gUHJvbXB0ZXIuJHNob3dUaW1lTGVmdC50ZXh0Q29udGVudCA9IGV2ZW50LmRldGFpbC50aW1lO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdFByb21wdGVyLiRzaG93VGltZUxlZnQudGV4dENvbnRlbnQgPSBcItCd0LXRgiDQvtC60L3QsCDRgdGD0YTQu9C10YDQsFwiO1xyXG5cdFx0XHR0aGF0Ll9vcGVuUHJvbXB0ZXJXaW5kb3codGhhdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRQcm9tcHRlci4kaW5wdXRBbmREaXNwbGF5VGltZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIHZhciBpbnB1dCA9IHBhcnNlSW5wdXQoKTtcclxuXHQgICAgaWYgKGlucHV0LmlzVmFsaWQpIFByb21wdGVyLiRpbnB1dEFuZERpc3BsYXlUaW1lLnZhbHVlID0gdG9TdHIoaW5wdXQudmFsdWUpO1xyXG5cdH0pO1xyXG5cdHRoaXMuXyRwcm9tcHRlcldpbmRvd0J1dHRvbk9uT2ZmLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhhdC5fcHJvbXB0ZXJXaW5kb3dPbk9mZik7XHJcblx0UHJvbXB0ZXIuJGlucHV0TWVzc2FnZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGF0Ll9wcm9jZXNzS2V5RG93bik7XHJcblx0UHJvbXB0ZXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJTdGFydGVkJywgdGhhdC5fdGltZXJTdGFydGVkKTtcclxuXHRQcm9tcHRlci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lckNoYW5nZWQnLCB0aGF0Ll9zaG93VGltZU9uUHJvbXB0ZXIpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyUGF1c2VkJywgdGhhdC5fdGltZXJQYXVzZWQpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyUnVuJywgdGhhdC5fdGltZXJSdW4pO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyQ2FuY2VsbGVkJywgdGhhdC5fdGltZXJDYW5jZWxsZWQpO1xyXG5cdFByb21wdGVyLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVPdmVyJywgdGhhdC5fdGltZU92ZXIpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
