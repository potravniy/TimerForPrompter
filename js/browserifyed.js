(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./model.js":8,"./parseInput.js":9}],2:[function(require,module,exports){
module.exports = function (timeInSeconds, fullFormat) {
    var sign = (timeInSeconds < 0) ? "-" : "";
    timeInSeconds = Math.abs(timeInSeconds);
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
    console.log("convert: " + sign + timeString);
    return sign + timeString;
}

},{}],3:[function(require,module,exports){
module.exports = function ($messageOnPrompter, $messageOnMain) {
	var temp = $messageOnPrompter.textContent;
	$messageOnPrompter.textContent = "";
	var scrollHeight = $messageOnPrompter.scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if(toggle){
			$messageOnPrompter.textContent = temp;
			toggle = false;
		} else {
			if($messageOnPrompter.scrollHeight > scrollHeight){
				temp = $messageOnPrompter.textContent.slice(0, -1);
				toggle = true;
			} else {
				clearInterval(id);
				$messageOnMain.textContent = temp;
			}
		}
	}
}
},{}],4:[function(require,module,exports){
module.exports = function (eventName, customEventInit) {
    var evnt = new CustomEvent(eventName, customEventInit);
    window.Tmr.$body.dispatchEvent(evnt);
}
},{}],5:[function(require,module,exports){
module.exports = function (event) {
	var fontColor = "",
		secondsLeft = event.detail.left;
	if(secondsLeft > 120){
		fontColor = "";
	} else if (secondsLeft > 60) {
		fontColor = "#ffa500";
	} else if (secondsLeft >= 0) {
		fontColor = "#f00";
	} else if (secondsLeft < 0) {
		fontColor = "#cc0066";
	}
    var fontSize = undefined,
		minFontSize = 23,
    	maxFontSize = 40,
    	minStringLength = 4,
    	maxStringLength = 8;
    fontSize = Math.floor(minFontSize + (maxStringLength - event.detail.time.length)
        * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));

	return {
		color: fontColor,
		size: fontSize + 'vw'
	}
}

},{}],6:[function(require,module,exports){
window.onload = function () {
    var TimerController = require('./controller.js');
	var TimerView = require("./view.js");
    var PrompterWindowController = require("./prompterWindowCtrl.js");
    var MessengerControllerAndView = require("./messenger.js");
    require('./secondsEventEmitter.js');

    window.Tmr = {
        $body: document.querySelector("body"),
        prompterWindow: null,
        state: {
            _prompterSt: "prompter-off",
            prompterSet: function(str){
                if(str==="prompter-off" || str==="prompter-on") {
                    window.Tmr.state._prompterSt = str;
                    window.Tmr.state._send();
                } else throw Error;
            },
            _timerSt: "no-timer",
            timerSet: function(str){
                if(str==="up" || str==="up-paused"
                || str==="down" || str==="down-paused"
                || str==="ddln" || str==="no-timer") {
                    window.Tmr.state._timerSt = str;
                    window.Tmr.state._send();
                } else throw Error;
            },
            _timerOver: "nope",
            timerSetOver: function(str){
                if(str==="nope" || str==="over") {
                    window.Tmr.state._timerOver = str;
                    window.Tmr.state._send();
                } else throw Error;
            },
            _send: function(){
                window.Tmr.$body.className = window.Tmr.state._prompterSt + " " 
                + window.Tmr.state._timerSt + " " + window.Tmr.state._timerOver;
            }
        }
    };
    
	new TimerController();
	new TimerView();
    new PrompterWindowController();
    new MessengerControllerAndView();
}
},{"./controller.js":1,"./messenger.js":7,"./prompterWindowCtrl.js":10,"./secondsEventEmitter.js":11,"./view.js":12}],7:[function(require,module,exports){
var cutContentToFit = require("./cutContentToFitDiv.js");
var emit = require("./emitEvent");

var Messenger = function() {
	var $inputMessage = document.querySelector("textarea#message");
	var $messageOnMain = document.querySelector("div#message_show");           
	var $messageOnPrompter = null;
	var that = this;
	this.emit = emit;	
	this._processMessage = function () {
	    if (window.Tmr.state._prompterSt === "prompter-on") {
			if (!$messageOnPrompter) {
				$messageOnPrompter = window.Tmr.prompterWindow
					.document.querySelector("div#message_show"); 
			}
	        that._showMessage();
	    } else {
			$messageOnPrompter = null;
	    	that.emit("openPrompterWindow");
	    }
	}
	this._showMessage = function () {
		$messageOnPrompter.textContent = $messageOnMain.textContent
			= $inputMessage.value;
		$inputMessage.value = "";
		cutContentToFit($messageOnPrompter, $messageOnMain);
	}
	this._processKeyDown = function (event) {
	    if (event.keyCode === 13) {
	        that._processMessage();
	        event.preventDefault();
	    } else if (event.keyCode === 27) {
			$inputMessage.value = "";
	    }
	}
	this._windowCreated = function(){
		$messageOnPrompter = window.Tmr.prompterWindow
			.document.querySelector("div#message_show");
		if($inputMessage.value) that._showMessage();
	}
	this._windowClosed = function(){
		$messageOnPrompter = null;
		$messageOnMain.textContent = "";
	}
	$inputMessage.addEventListener("keydown", that._processKeyDown);
	window.Tmr.$body.addEventListener('prompterWindowCreated'
		, that._windowCreated);
	window.Tmr.$body.addEventListener('prompterWindowClosed'
		, that._windowClosed);
}
module.exports = Messenger;
},{"./cutContentToFitDiv.js":3,"./emitEvent":4}],8:[function(require,module,exports){
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
},{"./convertTimeFromSecondsToString.js":2,"./emitEvent":4}],9:[function(require,module,exports){
module.exports = function (timeString) {
    if (!timeString) {
        var $inputTime = document.querySelector("input#time");
        timeString = ($inputTime.value ? $inputTime.value : 0);
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
                $inputTime.value = "ЧЧ:ММ:СС";
                return result
            }
            if (timeString[i] !== ":") {
                timeNumber = timeNumber * 10 + (+timeString[i]);
            }
        }
    } else timeNumber = timeString;

    var hours = Math.floor(timeNumber / 10000);
    if (hours > 23) {
        $inputTime.value = "ЧЧ > 23";
        return result
    }
    var minutes = Math.floor((timeNumber - hours * 10000) / 100);
    if (minutes > 59) {
        $inputTime.value = "ММ > 59";
        return result
    }
    var seconds = Math.floor(timeNumber - hours * 10000 - minutes * 100);
    if (seconds > 59) {
        $inputTime.value = "СС > 59";
        return result
    }
    var timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return result = {
        value: timeInSeconds,
        isValid: true
    }
}

},{}],10:[function(require,module,exports){
var WinControl = function(){
	this.emit = require("./emitEvent");
	this._$buttonOnOff = document.querySelector("button#screen2");
	var that = this;
	this._openWindow = function() {
	    var strWindowFeatures = "menubar=no, location=no, locationbar=no";
		strWindowFeatures += "toolbar=no, personalbar=no, status=no";
		strWindowFeatures += "resizable=yes, scrollbars=no,status=no";
	    var strWindowPositionAndSize = "height=300,width=500";
//		var loc = "http://potravniy.github.io/";
//	    window.Tmr.prompterWindow = window.open(loc + "prompter.html", "prompter"
	    window.Tmr.prompterWindow = window.open("prompter.html","prompter"
			, strWindowPositionAndSize + "," + strWindowFeatures);
	    if(!window.Tmr.prompterWindow) return;
	    window.Tmr.prompterWindow.addEventListener('load', start);
		function start() {
//	        var w = window.Tmr.prompterWindow;
	        window.Tmr.state.prompterSet("prompter-on");
		    window.addEventListener('unload', that._closeIfWindowIs);
	        window.Tmr.prompterWindow.addEventListener('unload'
				, that._closeWindow);
//			var i = that.a();
//			if(i.l!==26 || i.r!==2555){setTimeout(w.close(), Math.floor(1500 + Math.random(3000)))}
		    window.Tmr.prompterWindow.removeEventListener('load', start);
			that.emit("prompterWindowCreated");
	    }
	}
	this._closeWindow = function() {
	    window.removeEventListener('unload', that._closeIfWindowIs);
	    window.Tmr.prompterWindow.removeEventListener('unload'
			, that._closeWindow);
	    window.Tmr.prompterWindow.close();
		window.Tmr.prompterWindow = null;
	    window.Tmr.state.prompterSet("prompter-off");
		that.emit("prompterWindowClosed");
	}
	this._toggleWindow = function () {
	    if (window.Tmr.state._prompterSt === "prompter-on"){
			that._closeWindow();
		} else that._openWindow();
	}
	this._closeIfWindowIs = function () {
	    if (window.Tmr.state._prompterSt === "prompter-on") {
			that._closeWindow();
		}
	}
	this._$buttonOnOff.addEventListener('click', that._toggleWindow);
	window.Tmr.$body.addEventListener('openPrompterWindow'
		, that._openWindow);
	// this.a = function(){
	// 	var o = location.origin;
	// 	var r = 0;
	// 	for(var i=0; i<o.length; i++) {
	// 		r += o.charCodeAt(i);
	// 	}
	// 	return {
	// 		r: r,
	// 		l: o.length
	// 	}
	// }
}
module.exports = WinControl;
},{"./emitEvent":4}],11:[function(require,module,exports){
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


},{"./emitEvent":4}],12:[function(require,module,exports){
/* global Prompter */
var parseInput = require('./parseInput.js');
var toStr = require('./convertTimeFromSecondsToString.js');
var fontFormat = require("./fontFormat.js");
var emit = require("./emitEvent");

var View = function () {
	var $body = window.Tmr.$body;
	var $inputTime = document.querySelector("input#time");
	var $timeOnMain = document.querySelector("div#time_left");
	var $timeOnPrompter = null;
	var temp = undefined;
	var that = this;
	this.emit = emit;
	
	this._timerStarted = function(event) {
		window.Tmr.state.timerSet(event.detail.type);
		that._showTime(event);
		switch (event.detail.type) {
			case "up":
			case "ddln":
				$inputTime.value = event.detail.deadline;   
				break
			case "down":
				$inputTime.value = event.detail.time;
				break
		}
	}
	this._timerPaused = function(event) {
		window.Tmr.state.timerSet(event.detail.type + "-paused");              
		that._showTime(event)
	}
	this._timerRun = function(event) {
		window.Tmr.state.timerSet(event.detail.type);
		that._showTime(event)
	}
	this._timerCancelled = function(event) {
		window.Tmr.state.timerSet("no-timer");
		window.Tmr.state.timerSetOver("nope");
		$timeOnPrompter.textContent = $timeOnMain.textContent = "";
	    $inputTime.value = "";
	}
	this._timeOver = function(event) {
		window.Tmr.state.timerSetOver("over");
		that._showTime(event)
	}
	this._showTime = function(event){
		if (window.Tmr.state._prompterSt === "prompter-on") {
			var font = fontFormat(event);
            $timeOnPrompter.style.fontSize = font.size;
			$timeOnPrompter.style.color
				= $timeOnMain.style.color = font.color;
			$timeOnPrompter.textContent
				= $timeOnMain.textContent = event.detail.time;
		}
		else {
	    	that.emit("openPrompterWindow");
			temp = event;
		}
	}
	this._onWindowCreate = function(){
		$timeOnPrompter = window.Tmr.prompterWindow.document
			.querySelector("#time_left");
		if(temp) {
			that._showTime(temp);
			temp = undefined;
		}
	}
	this._onWindowClose = function(){
		$timeOnPrompter = null;
	}
	$inputTime.addEventListener('change', function () {
	    var input = parseInput();
	    if (input.isValid) $inputTime.value = toStr(input.value);
	});
	$body.addEventListener('timerStarted', that._timerStarted);
	$body.addEventListener('timerChanged', that._showTime);
	$body.addEventListener('timerPaused', that._timerPaused);
	$body.addEventListener('timerRun', that._timerRun);
	$body.addEventListener('timerCancelled', that._timerCancelled);
	$body.addEventListener('timeOver', that._timeOver);
	$body.addEventListener('prompterWindowCreated', that._onWindowCreate);
	$body.addEventListener('prompterWindowClosed', that._onWindowClose);
	window.Tmr.state._send();
}

module.exports = View;
},{"./convertTimeFromSecondsToString.js":2,"./emitEvent":4,"./fontFormat.js":5,"./parseInput.js":9}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb250cm9sbGVyLmpzIiwianMvY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzIiwianMvY3V0Q29udGVudFRvRml0RGl2LmpzIiwianMvZW1pdEV2ZW50LmpzIiwianMvZm9udEZvcm1hdC5qcyIsImpzL21haW4uanMiLCJqcy9tZXNzZW5nZXIuanMiLCJqcy9tb2RlbC5qcyIsImpzL3BhcnNlSW5wdXQuanMiLCJqcy9wcm9tcHRlcldpbmRvd0N0cmwuanMiLCJqcy9zZWNvbmRzRXZlbnRFbWl0dGVyLmpzIiwianMvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgVGltZXIgPSByZXF1aXJlKCcuL21vZGVsLmpzJyk7XHJcbnZhciBwYXJzZUlucHV0ID0gcmVxdWlyZSgnLi9wYXJzZUlucHV0LmpzJyk7XHJcblxyXG52YXIgQ29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkYnV0dG9uQ291bnRVcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jdXBcIik7XHJcbiAgICB2YXIgJGJ1dHRvbkNvdW50RG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jZG93blwiKTtcclxuICAgIHZhciAkYnV0dG9uQ291bnREZWFkbGluZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jZGVhZGxpbmVcIik7XHJcbiAgICB2YXIgJGJ1dHRvblJlc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNyZXNldFwiKTtcclxuXHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0dGhpcy5fdGltZXIgPSBudWxsO1xyXG5cdHRoaXMuX2J1dHRvbkNsaWNrUHJvY2Vzc2luZyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0dmFyIGlucHV0ID0gcGFyc2VJbnB1dCgpO1xyXG5cdFx0aWYoIWlucHV0LmlzVmFsaWQpIHJldHVybjtcclxuXHRcdHN3aXRjaCAoZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQpIHtcclxuXHRcdFx0Y2FzZSAkYnV0dG9uQ291bnRVcCA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwidXBcIiwgaW5wdXQudmFsdWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJ1cFwiICYmICF0aGF0Ll90aW1lci5wYXVzZWQpIHtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyLnBhdXNlKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGF0Ll90aW1lci50eXBlID09PSBcInVwXCIgJiYgdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5ydW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAkYnV0dG9uQ291bnREb3duIDpcclxuXHRcdFx0XHRpZighdGhhdC5fdGltZXIpe1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIgPSBuZXcgVGltZXIoXCJkb3duXCIsIGlucHV0LnZhbHVlKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwiZG93blwiICYmICF0aGF0Ll90aW1lci5wYXVzZWQpIHtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyLnBhdXNlKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGF0Ll90aW1lci50eXBlID09PSBcImRvd25cIiAmJiB0aGF0Ll90aW1lci5wYXVzZWQpIHtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyLnJ1bigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHRjYXNlICRidXR0b25Db3VudERlYWRsaW5lIDpcclxuXHRcdFx0XHRpZighdGhhdC5fdGltZXIpe1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIgPSBuZXcgVGltZXIoXCJkZGxuXCIsIGlucHV0LnZhbHVlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAkYnV0dG9uUmVzZXQgOlxyXG5cdFx0XHRcdGlmICh0aGF0Ll90aW1lcikgdGhhdC5fdGltZXIuY2FuY2VsKCk7XHJcblx0XHRcdFx0dGhhdC5fdGltZXIgPSBudWxsO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblx0fVxyXG5cdHdpbmRvdy5UbXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoYXQuX2J1dHRvbkNsaWNrUHJvY2Vzc2luZyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlcjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0aW1lSW5TZWNvbmRzLCBmdWxsRm9ybWF0KSB7XHJcbiAgICB2YXIgc2lnbiA9ICh0aW1lSW5TZWNvbmRzIDwgMCkgPyBcIi1cIiA6IFwiXCI7XHJcbiAgICB0aW1lSW5TZWNvbmRzID0gTWF0aC5hYnModGltZUluU2Vjb25kcyk7XHJcbiAgICB2YXIgaCA9IE1hdGguZmxvb3IodGltZUluU2Vjb25kcyAvICgzNjAwKSk7XHJcbiAgICB2YXIgbSA9IE1hdGguZmxvb3IoKHRpbWVJblNlY29uZHMgLSBoICogMzYwMCkgLyA2MCk7XHJcbiAgICB2YXIgcyA9IE1hdGguZmxvb3IodGltZUluU2Vjb25kcyAtIGggKiAzNjAwIC0gbSAqIDYwKTtcclxuICAgIHZhciB0aW1lU3RyaW5nID0gXCI6XCIgKyAocyA8IDEwID8gXCIwXCIgKyBzIDogcyk7XHJcbiAgICBpZihmdWxsRm9ybWF0KXtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKGggPCAxMCA/IFwiMFwiICsgaCA6IGgpICsgXCI6XCIgKyAobSA8IDEwID8gXCIwXCIgKyBtIDogbSkgKyB0aW1lU3RyaW5nO1xyXG4gICAgfWVsc2Uge1xyXG4gICAgICAgIGlmIChoID4gMCkge1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gaCArIFwiOlwiICsgKG0gPCAxMCA/IFwiMFwiICsgbSA6IG0pICsgdGltZVN0cmluZztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gbSArIHRpbWVTdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJjb252ZXJ0OiBcIiArIHNpZ24gKyB0aW1lU3RyaW5nKTtcclxuICAgIHJldHVybiBzaWduICsgdGltZVN0cmluZztcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkbWVzc2FnZU9uUHJvbXB0ZXIsICRtZXNzYWdlT25NYWluKSB7XHJcblx0dmFyIHRlbXAgPSAkbWVzc2FnZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQ7XHJcblx0JG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHR2YXIgc2Nyb2xsSGVpZ2h0ID0gJG1lc3NhZ2VPblByb21wdGVyLnNjcm9sbEhlaWdodCxcclxuXHRcdHRvZ2dsZSA9IHRydWU7XHJcblx0dmFyIGlkID0gc2V0SW50ZXJ2YWwoY3V0Q29udGVudFRvRml0RGl2LCA0KTtcclxuXHRmdW5jdGlvbiBjdXRDb250ZW50VG9GaXREaXYoKSB7XHJcblx0XHRpZih0b2dnbGUpe1xyXG5cdFx0XHQkbWVzc2FnZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQgPSB0ZW1wO1xyXG5cdFx0XHR0b2dnbGUgPSBmYWxzZTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmKCRtZXNzYWdlT25Qcm9tcHRlci5zY3JvbGxIZWlnaHQgPiBzY3JvbGxIZWlnaHQpe1xyXG5cdFx0XHRcdHRlbXAgPSAkbWVzc2FnZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQuc2xpY2UoMCwgLTEpO1xyXG5cdFx0XHRcdHRvZ2dsZSA9IHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbChpZCk7XHJcblx0XHRcdFx0JG1lc3NhZ2VPbk1haW4udGV4dENvbnRlbnQgPSB0ZW1wO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBjdXN0b21FdmVudEluaXQpIHtcclxuICAgIHZhciBldm50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgY3VzdG9tRXZlbnRJbml0KTtcclxuICAgIHdpbmRvdy5UbXIuJGJvZHkuZGlzcGF0Y2hFdmVudChldm50KTtcclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcblx0dmFyIGZvbnRDb2xvciA9IFwiXCIsXHJcblx0XHRzZWNvbmRzTGVmdCA9IGV2ZW50LmRldGFpbC5sZWZ0O1xyXG5cdGlmKHNlY29uZHNMZWZ0ID4gMTIwKXtcclxuXHRcdGZvbnRDb2xvciA9IFwiXCI7XHJcblx0fSBlbHNlIGlmIChzZWNvbmRzTGVmdCA+IDYwKSB7XHJcblx0XHRmb250Q29sb3IgPSBcIiNmZmE1MDBcIjtcclxuXHR9IGVsc2UgaWYgKHNlY29uZHNMZWZ0ID49IDApIHtcclxuXHRcdGZvbnRDb2xvciA9IFwiI2YwMFwiO1xyXG5cdH0gZWxzZSBpZiAoc2Vjb25kc0xlZnQgPCAwKSB7XHJcblx0XHRmb250Q29sb3IgPSBcIiNjYzAwNjZcIjtcclxuXHR9XHJcbiAgICB2YXIgZm9udFNpemUgPSB1bmRlZmluZWQsXHJcblx0XHRtaW5Gb250U2l6ZSA9IDIzLFxyXG4gICAgXHRtYXhGb250U2l6ZSA9IDQwLFxyXG4gICAgXHRtaW5TdHJpbmdMZW5ndGggPSA0LFxyXG4gICAgXHRtYXhTdHJpbmdMZW5ndGggPSA4O1xyXG4gICAgZm9udFNpemUgPSBNYXRoLmZsb29yKG1pbkZvbnRTaXplICsgKG1heFN0cmluZ0xlbmd0aCAtIGV2ZW50LmRldGFpbC50aW1lLmxlbmd0aClcclxuICAgICAgICAqIChtYXhGb250U2l6ZSAtIG1pbkZvbnRTaXplKSAvIChtYXhTdHJpbmdMZW5ndGggLSBtaW5TdHJpbmdMZW5ndGgpKTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGNvbG9yOiBmb250Q29sb3IsXHJcblx0XHRzaXplOiBmb250U2l6ZSArICd2dydcclxuXHR9XHJcbn1cclxuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBUaW1lckNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIuanMnKTtcclxuXHR2YXIgVGltZXJWaWV3ID0gcmVxdWlyZShcIi4vdmlldy5qc1wiKTtcclxuICAgIHZhciBQcm9tcHRlcldpbmRvd0NvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9wcm9tcHRlcldpbmRvd0N0cmwuanNcIik7XHJcbiAgICB2YXIgTWVzc2VuZ2VyQ29udHJvbGxlckFuZFZpZXcgPSByZXF1aXJlKFwiLi9tZXNzZW5nZXIuanNcIik7XHJcbiAgICByZXF1aXJlKCcuL3NlY29uZHNFdmVudEVtaXR0ZXIuanMnKTtcclxuXHJcbiAgICB3aW5kb3cuVG1yID0ge1xyXG4gICAgICAgICRib2R5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKSxcclxuICAgICAgICBwcm9tcHRlcldpbmRvdzogbnVsbCxcclxuICAgICAgICBzdGF0ZToge1xyXG4gICAgICAgICAgICBfcHJvbXB0ZXJTdDogXCJwcm9tcHRlci1vZmZcIixcclxuICAgICAgICAgICAgcHJvbXB0ZXJTZXQ6IGZ1bmN0aW9uKHN0cil7XHJcbiAgICAgICAgICAgICAgICBpZihzdHI9PT1cInByb21wdGVyLW9mZlwiIHx8IHN0cj09PVwicHJvbXB0ZXItb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UbXIuc3RhdGUuX3Byb21wdGVyU3QgPSBzdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRtci5zdGF0ZS5fc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHRocm93IEVycm9yO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBfdGltZXJTdDogXCJuby10aW1lclwiLFxyXG4gICAgICAgICAgICB0aW1lclNldDogZnVuY3Rpb24oc3RyKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0cj09PVwidXBcIiB8fCBzdHI9PT1cInVwLXBhdXNlZFwiXHJcbiAgICAgICAgICAgICAgICB8fCBzdHI9PT1cImRvd25cIiB8fCBzdHI9PT1cImRvd24tcGF1c2VkXCJcclxuICAgICAgICAgICAgICAgIHx8IHN0cj09PVwiZGRsblwiIHx8IHN0cj09PVwibm8tdGltZXJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UbXIuc3RhdGUuX3RpbWVyU3QgPSBzdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRtci5zdGF0ZS5fc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHRocm93IEVycm9yO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBfdGltZXJPdmVyOiBcIm5vcGVcIixcclxuICAgICAgICAgICAgdGltZXJTZXRPdmVyOiBmdW5jdGlvbihzdHIpe1xyXG4gICAgICAgICAgICAgICAgaWYoc3RyPT09XCJub3BlXCIgfHwgc3RyPT09XCJvdmVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVG1yLnN0YXRlLl90aW1lck92ZXIgPSBzdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRtci5zdGF0ZS5fc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHRocm93IEVycm9yO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBfc2VuZDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5UbXIuJGJvZHkuY2xhc3NOYW1lID0gd2luZG93LlRtci5zdGF0ZS5fcHJvbXB0ZXJTdCArIFwiIFwiIFxyXG4gICAgICAgICAgICAgICAgKyB3aW5kb3cuVG1yLnN0YXRlLl90aW1lclN0ICsgXCIgXCIgKyB3aW5kb3cuVG1yLnN0YXRlLl90aW1lck92ZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcblx0bmV3IFRpbWVyQ29udHJvbGxlcigpO1xyXG5cdG5ldyBUaW1lclZpZXcoKTtcclxuICAgIG5ldyBQcm9tcHRlcldpbmRvd0NvbnRyb2xsZXIoKTtcclxuICAgIG5ldyBNZXNzZW5nZXJDb250cm9sbGVyQW5kVmlldygpO1xyXG59IiwidmFyIGN1dENvbnRlbnRUb0ZpdCA9IHJlcXVpcmUoXCIuL2N1dENvbnRlbnRUb0ZpdERpdi5qc1wiKTtcclxudmFyIGVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XHJcblxyXG52YXIgTWVzc2VuZ2VyID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyICRpbnB1dE1lc3NhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwidGV4dGFyZWEjbWVzc2FnZVwiKTtcclxuXHR2YXIgJG1lc3NhZ2VPbk1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZGl2I21lc3NhZ2Vfc2hvd1wiKTsgICAgICAgICAgIFxyXG5cdHZhciAkbWVzc2FnZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHR0aGlzLmVtaXQgPSBlbWl0O1x0XHJcblx0dGhpcy5fcHJvY2Vzc01lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh3aW5kb3cuVG1yLnN0YXRlLl9wcm9tcHRlclN0ID09PSBcInByb21wdGVyLW9uXCIpIHtcclxuXHRcdFx0aWYgKCEkbWVzc2FnZU9uUHJvbXB0ZXIpIHtcclxuXHRcdFx0XHQkbWVzc2FnZU9uUHJvbXB0ZXIgPSB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93XHJcblx0XHRcdFx0XHQuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIik7IFxyXG5cdFx0XHR9XHJcblx0ICAgICAgICB0aGF0Ll9zaG93TWVzc2FnZSgpO1xyXG5cdCAgICB9IGVsc2Uge1xyXG5cdFx0XHQkbWVzc2FnZU9uUHJvbXB0ZXIgPSBudWxsO1xyXG5cdCAgICBcdHRoYXQuZW1pdChcIm9wZW5Qcm9tcHRlcldpbmRvd1wiKTtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9zaG93TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdCRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudCA9ICRtZXNzYWdlT25NYWluLnRleHRDb250ZW50XHJcblx0XHRcdD0gJGlucHV0TWVzc2FnZS52YWx1ZTtcclxuXHRcdCRpbnB1dE1lc3NhZ2UudmFsdWUgPSBcIlwiO1xyXG5cdFx0Y3V0Q29udGVudFRvRml0KCRtZXNzYWdlT25Qcm9tcHRlciwgJG1lc3NhZ2VPbk1haW4pO1xyXG5cdH1cclxuXHR0aGlzLl9wcm9jZXNzS2V5RG93biA9IGZ1bmN0aW9uIChldmVudCkge1xyXG5cdCAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuXHQgICAgICAgIHRoYXQuX3Byb2Nlc3NNZXNzYWdlKCk7XHJcblx0ICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDI3KSB7XHJcblx0XHRcdCRpbnB1dE1lc3NhZ2UudmFsdWUgPSBcIlwiO1xyXG5cdCAgICB9XHJcblx0fVxyXG5cdHRoaXMuX3dpbmRvd0NyZWF0ZWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0JG1lc3NhZ2VPblByb21wdGVyID0gd2luZG93LlRtci5wcm9tcHRlcldpbmRvd1xyXG5cdFx0XHQuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIik7XHJcblx0XHRpZigkaW5wdXRNZXNzYWdlLnZhbHVlKSB0aGF0Ll9zaG93TWVzc2FnZSgpO1xyXG5cdH1cclxuXHR0aGlzLl93aW5kb3dDbG9zZWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0JG1lc3NhZ2VPblByb21wdGVyID0gbnVsbDtcclxuXHRcdCRtZXNzYWdlT25NYWluLnRleHRDb250ZW50ID0gXCJcIjtcclxuXHR9XHJcblx0JGlucHV0TWVzc2FnZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGF0Ll9wcm9jZXNzS2V5RG93bik7XHJcblx0d2luZG93LlRtci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCdwcm9tcHRlcldpbmRvd0NyZWF0ZWQnXHJcblx0XHQsIHRoYXQuX3dpbmRvd0NyZWF0ZWQpO1xyXG5cdHdpbmRvdy5UbXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigncHJvbXB0ZXJXaW5kb3dDbG9zZWQnXHJcblx0XHQsIHRoYXQuX3dpbmRvd0Nsb3NlZCk7XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBNZXNzZW5nZXI7IiwidmFyIHRvU3RyID0gcmVxdWlyZShcIi4vY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzXCIpO1xudmFyIGVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XG5cbnZhciBUaW1lciA9IGZ1bmN0aW9uICh0eXBlT2ZUaW1lciwgZW50ZXJlZFNlY29uZHMpIHtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR0aGlzLmVtaXQgPSBlbWl0O1xuXHR0aGlzLnR5cGUgPSB0eXBlT2ZUaW1lcjtcblx0c3dpdGNoICh0eXBlT2ZUaW1lcil7XG5cdGNhc2UgXCJ1cFwiOlxuXHRcdHRoaXMudGltZXJWYWx1ZSA9IDA7XG5cdFx0dGhpcy5kZWFkbGluZSA9IGVudGVyZWRTZWNvbmRzO1xuXHRcdHRoaXMuc2VjTGVmdCA9ICh0aGlzLmRlYWRsaW5lID4gMCA/IFxuXHRcdFx0dGhpcy5kZWFkbGluZSAtIHRoaXMudGltZXJWYWx1ZSA6IEluZmluaXR5KTtcblx0XHR0aGlzLnRpbWVMZWZ0ID0gZnVuY3Rpb24gKCl7XG5cdFx0XHR0aGF0LnRpbWVyVmFsdWUrKztcblx0XHRcdHRoYXQuc2VjTGVmdCA9ICh0aGF0LmRlYWRsaW5lID4gMCA/IFxuXHRcdFx0XHR0aGF0LmRlYWRsaW5lIC0gdGhhdC50aW1lclZhbHVlIDogSW5maW5pdHkpO1xuXHRcdFx0dGhhdC5lbWl0KCd0aW1lckNoYW5nZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRpZih0aGF0LnNlY0xlZnQgPT09IDApIHtcblx0XHRcdFx0Ly8gdGhhdC5wYXVzZSgpO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVPdmVyJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnBhdXNlID0gZnVuY3Rpb24oKXtcblx0XHRcdHdpbmRvdy5UbXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHR0aGF0LnBhdXNlZCA9IHRydWU7XG5cdFx0XHR0aGF0LmVtaXQoJ3RpbWVyUGF1c2VkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdH1cblx0XHR0aGlzLnJ1biA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR3aW5kb3cuVG1yLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0dGhhdC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdHRoYXQuZW1pdCgndGltZXJSdW4nLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0fVxuXHRcdGJyZWFrXG5cdGNhc2UgXCJkb3duXCI6XG5cdFx0dGhpcy50aW1lclZhbHVlID0gKGVudGVyZWRTZWNvbmRzID8gZW50ZXJlZFNlY29uZHMgOiAzNTk5KTtcblx0XHR0aGlzLmRlYWRsaW5lID0gMDtcblx0XHR0aGlzLnNlY0xlZnQgPSB0aGlzLnRpbWVyVmFsdWU7XG5cdFx0dGhpcy50aW1lTGVmdCA9IGZ1bmN0aW9uICgpe1xuXHRcdFx0dGhhdC50aW1lclZhbHVlLS07XG5cdFx0XHR0aGF0LnNlY0xlZnQgPSB0aGF0LnRpbWVyVmFsdWU7XG5cdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdGlmKHRoYXQudGltZXJWYWx1ZSA9PT0gMCkge1xuXHRcdFx0XHQvLyB0aGF0LnBhdXNlKCk7XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZU92ZXInLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMucGF1c2UgPSBmdW5jdGlvbigpe1xuXHRcdFx0d2luZG93LlRtci4kYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdHRoYXQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdHRoYXQuZW1pdCgndGltZXJQYXVzZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0fVxuXHRcdHRoaXMucnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdHdpbmRvdy5UbXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHR0aGF0LnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0dGhhdC5lbWl0KCd0aW1lclJ1bicsIGN1c3RvbURldGFpbCgpKTtcblx0XHR9XG5cdFx0YnJlYWtcblx0Y2FzZSBcImRkbG5cIjpcblx0XHR2YXIgZW50ZXJlZFRpbWUgPSB0b1N0cihlbnRlcmVkU2Vjb25kcywgdHJ1ZSk7XG5cdFx0dGhpcy5kZWFkbGluZSA9IG5ldyBEYXRlKCk7XG5cdFx0dGhpcy5kZWFkbGluZS5zZXRIb3VycygrZW50ZXJlZFRpbWUuc3Vic3RyaW5nKDAsIDIpKTtcblx0XHR0aGlzLmRlYWRsaW5lLnNldE1pbnV0ZXMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygzLCA1KSk7XG5cdFx0dGhpcy5kZWFkbGluZS5zZXRTZWNvbmRzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoNikpO1xuXHRcdGlmICh0aGlzLmRlYWRsaW5lIDwgbmV3IERhdGUoKSkge1xuXHRcdFx0dGhpcy5kZWFkbGluZS5zZXREYXRlKHRoaXMuZGVhZGxpbmUuZ2V0RGF0ZSgpICsgMSk7XG5cdFx0fVxuXHRcdHRoaXMuZGVhZGxpbmUudG9TdHIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAodGhhdC5kZWFkbGluZS5nZXRIb3VycygpKyc6Jyt0aGF0LmRlYWRsaW5lLmdldE1pbnV0ZXMoKVxuXHRcdFx0XHQrICc6JyArIHRoYXQuZGVhZGxpbmUuZ2V0U2Vjb25kcygpKTtcblx0XHR9XG5cdFx0dGhpcy50aW1lclZhbHVlID0gTWF0aC5mbG9vcigodGhpcy5kZWFkbGluZSAtIG5ldyBEYXRlKCkpIC8gMTAwMCk7XG5cdFx0dGhpcy5zZWNMZWZ0ID0gdGhpcy50aW1lclZhbHVlO1xuXHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGF0LnRpbWVyVmFsdWUgPSBNYXRoLmZsb29yKCh0aGF0LmRlYWRsaW5lIC0gbmV3IERhdGUoKSkvMTAwMCk7XG5cdFx0XHR0aGF0LnNlY0xlZnQgPSB0aGF0LnRpbWVyVmFsdWU7XG5cdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdGlmICh0aGF0LnRpbWVyVmFsdWUgPT09IDApe1xuXHRcdFx0XHQvLyB3aW5kb3cuVG1yLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCdcblx0XHRcdFx0Ly8gXHQsIHRoYXQudGltZUxlZnQpO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVPdmVyJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRicmVha1xuXHR9XG5cdHRoaXMuY2FuY2VsID0gZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuVG1yLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdHRoYXQuZW1pdCgndGltZXJDYW5jZWxsZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdH1cblx0dGhpcy5lbWl0KCd0aW1lclN0YXJ0ZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdHdpbmRvdy5UbXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdGZ1bmN0aW9uIGN1c3RvbURldGFpbCgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGV0YWlsOiB7XG5cdFx0XHRcdHR5cGU6IHR5cGVPZlRpbWVyLFxuXHRcdFx0XHR0aW1lOiB0b1N0cih0aGF0LnRpbWVyVmFsdWUpLFxuXHRcdFx0XHRsZWZ0OiB0aGF0LnNlY0xlZnQsXG5cdFx0XHRcdGRlYWRsaW5lOiAodHlwZU9mVGltZXIgPT09IFwiZGRsblwiID8gXG5cdFx0XHRcdFx0dGhhdC5kZWFkbGluZS50b1N0cigpIDogdG9TdHIodGhhdC5kZWFkbGluZSkpXG5cdFx0XHR9XG5cdFx0fVx0XG5cdH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGltZVN0cmluZykge1xyXG4gICAgaWYgKCF0aW1lU3RyaW5nKSB7XHJcbiAgICAgICAgdmFyICRpbnB1dFRpbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaW5wdXQjdGltZVwiKTtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKCRpbnB1dFRpbWUudmFsdWUgPyAkaW5wdXRUaW1lLnZhbHVlIDogMCk7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIHZhbHVlOiBOYU4sXHJcbiAgICAgICAgaXNWYWxpZDogZmFsc2VcclxuICAgIH1cclxuICAgIGlmIChpc05hTih0aW1lU3RyaW5nKSkge1xyXG4gICAgICAgIHZhciB2YWxpZENoYXJzID0gWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIFwiOlwiXTtcclxuICAgICAgICB2YXIgdGltZU51bWJlciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lU3RyaW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBpc0NoYXJWYWxpZCA9IHZhbGlkQ2hhcnMuc29tZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVTdHJpbmdbaV0gPT0gaXRlbTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaWYgKCFpc0NoYXJWYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgJGlucHV0VGltZS52YWx1ZSA9IFwi0KfQpzrQnNCcOtCh0KFcIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGltZVN0cmluZ1tpXSAhPT0gXCI6XCIpIHtcclxuICAgICAgICAgICAgICAgIHRpbWVOdW1iZXIgPSB0aW1lTnVtYmVyICogMTAgKyAoK3RpbWVTdHJpbmdbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHRpbWVOdW1iZXIgPSB0aW1lU3RyaW5nO1xyXG5cclxuICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZU51bWJlciAvIDEwMDAwKTtcclxuICAgIGlmIChob3VycyA+IDIzKSB7XHJcbiAgICAgICAgJGlucHV0VGltZS52YWx1ZSA9IFwi0KfQpyA+IDIzXCI7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKCh0aW1lTnVtYmVyIC0gaG91cnMgKiAxMDAwMCkgLyAxMDApO1xyXG4gICAgaWYgKG1pbnV0ZXMgPiA1OSkge1xyXG4gICAgICAgICRpbnB1dFRpbWUudmFsdWUgPSBcItCc0JwgPiA1OVwiO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lTnVtYmVyIC0gaG91cnMgKiAxMDAwMCAtIG1pbnV0ZXMgKiAxMDApO1xyXG4gICAgaWYgKHNlY29uZHMgPiA1OSkge1xyXG4gICAgICAgICRpbnB1dFRpbWUudmFsdWUgPSBcItCh0KEgPiA1OVwiO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciB0aW1lSW5TZWNvbmRzID0gaG91cnMgKiAzNjAwICsgbWludXRlcyAqIDYwICsgc2Vjb25kcztcclxuICAgIHJldHVybiByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IHRpbWVJblNlY29uZHMsXHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZVxyXG4gICAgfVxyXG59XHJcbiIsInZhciBXaW5Db250cm9sID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XHJcblx0dGhpcy5fJGJ1dHRvbk9uT2ZmID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNzY3JlZW4yXCIpO1xyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHR0aGlzLl9vcGVuV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0ICAgIHZhciBzdHJXaW5kb3dGZWF0dXJlcyA9IFwibWVudWJhcj1ubywgbG9jYXRpb249bm8sIGxvY2F0aW9uYmFyPW5vXCI7XHJcblx0XHRzdHJXaW5kb3dGZWF0dXJlcyArPSBcInRvb2xiYXI9bm8sIHBlcnNvbmFsYmFyPW5vLCBzdGF0dXM9bm9cIjtcclxuXHRcdHN0cldpbmRvd0ZlYXR1cmVzICs9IFwicmVzaXphYmxlPXllcywgc2Nyb2xsYmFycz1ubyxzdGF0dXM9bm9cIjtcclxuXHQgICAgdmFyIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSA9IFwiaGVpZ2h0PTMwMCx3aWR0aD01MDBcIjtcclxuLy9cdFx0dmFyIGxvYyA9IFwiaHR0cDovL3BvdHJhdm5peS5naXRodWIuaW8vXCI7XHJcbi8vXHQgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdyA9IHdpbmRvdy5vcGVuKGxvYyArIFwicHJvbXB0ZXIuaHRtbFwiLCBcInByb21wdGVyXCJcclxuXHQgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdyA9IHdpbmRvdy5vcGVuKFwicHJvbXB0ZXIuaHRtbFwiLFwicHJvbXB0ZXJcIlxyXG5cdFx0XHQsIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSArIFwiLFwiICsgc3RyV2luZG93RmVhdHVyZXMpO1xyXG5cdCAgICBpZighd2luZG93LlRtci5wcm9tcHRlcldpbmRvdykgcmV0dXJuO1xyXG5cdCAgICB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBzdGFydCk7XHJcblx0XHRmdW5jdGlvbiBzdGFydCgpIHtcclxuLy9cdCAgICAgICAgdmFyIHcgPSB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93O1xyXG5cdCAgICAgICAgd2luZG93LlRtci5zdGF0ZS5wcm9tcHRlclNldChcInByb21wdGVyLW9uXCIpO1xyXG5cdFx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnLCB0aGF0Ll9jbG9zZUlmV2luZG93SXMpO1xyXG5cdCAgICAgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnXHJcblx0XHRcdFx0LCB0aGF0Ll9jbG9zZVdpbmRvdyk7XHJcbi8vXHRcdFx0dmFyIGkgPSB0aGF0LmEoKTtcclxuLy9cdFx0XHRpZihpLmwhPT0yNiB8fCBpLnIhPT0yNTU1KXtzZXRUaW1lb3V0KHcuY2xvc2UoKSwgTWF0aC5mbG9vcigxNTAwICsgTWF0aC5yYW5kb20oMzAwMCkpKX1cclxuXHRcdCAgICB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBzdGFydCk7XHJcblx0XHRcdHRoYXQuZW1pdChcInByb21wdGVyV2luZG93Q3JlYXRlZFwiKTtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9jbG9zZVdpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdCAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fY2xvc2VJZldpbmRvd0lzKTtcclxuXHQgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd1bmxvYWQnXHJcblx0XHRcdCwgdGhhdC5fY2xvc2VXaW5kb3cpO1xyXG5cdCAgICB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LmNsb3NlKCk7XHJcblx0XHR3aW5kb3cuVG1yLnByb21wdGVyV2luZG93ID0gbnVsbDtcclxuXHQgICAgd2luZG93LlRtci5zdGF0ZS5wcm9tcHRlclNldChcInByb21wdGVyLW9mZlwiKTtcclxuXHRcdHRoYXQuZW1pdChcInByb21wdGVyV2luZG93Q2xvc2VkXCIpO1xyXG5cdH1cclxuXHR0aGlzLl90b2dnbGVXaW5kb3cgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh3aW5kb3cuVG1yLnN0YXRlLl9wcm9tcHRlclN0ID09PSBcInByb21wdGVyLW9uXCIpe1xyXG5cdFx0XHR0aGF0Ll9jbG9zZVdpbmRvdygpO1xyXG5cdFx0fSBlbHNlIHRoYXQuX29wZW5XaW5kb3coKTtcclxuXHR9XHJcblx0dGhpcy5fY2xvc2VJZldpbmRvd0lzID0gZnVuY3Rpb24gKCkge1xyXG5cdCAgICBpZiAod2luZG93LlRtci5zdGF0ZS5fcHJvbXB0ZXJTdCA9PT0gXCJwcm9tcHRlci1vblwiKSB7XHJcblx0XHRcdHRoYXQuX2Nsb3NlV2luZG93KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuXyRidXR0b25Pbk9mZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoYXQuX3RvZ2dsZVdpbmRvdyk7XHJcblx0d2luZG93LlRtci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCdvcGVuUHJvbXB0ZXJXaW5kb3cnXHJcblx0XHQsIHRoYXQuX29wZW5XaW5kb3cpO1xyXG5cdC8vIHRoaXMuYSA9IGZ1bmN0aW9uKCl7XHJcblx0Ly8gXHR2YXIgbyA9IGxvY2F0aW9uLm9yaWdpbjtcclxuXHQvLyBcdHZhciByID0gMDtcclxuXHQvLyBcdGZvcih2YXIgaT0wOyBpPG8ubGVuZ3RoOyBpKyspIHtcclxuXHQvLyBcdFx0ciArPSBvLmNoYXJDb2RlQXQoaSk7XHJcblx0Ly8gXHR9XHJcblx0Ly8gXHRyZXR1cm4ge1xyXG5cdC8vIFx0XHRyOiByLFxyXG5cdC8vIFx0XHRsOiBvLmxlbmd0aFxyXG5cdC8vIFx0fVxyXG5cdC8vIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IFdpbkNvbnRyb2w7IiwidmFyIGVtaXQgPSByZXF1aXJlKCcuL2VtaXRFdmVudCcpO1xyXG52YXIgY3VycmVudFRpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxudmFyIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbChlbWl0RXZlbnRFdmVyeVNlY29uZCwgMTAwKTtcclxuXHJcbmZ1bmN0aW9uIGVtaXRFdmVudEV2ZXJ5U2Vjb25kKCkge1xyXG4gICAgdmFyIG5ld1RpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIGlmIChjdXJyZW50VGltZUluU2Vjb25kcyAhPT0gbmV3VGltZUluU2Vjb25kcykge1xyXG4gICAgICAgIGN1cnJlbnRUaW1lSW5TZWNvbmRzID0gbmV3VGltZUluU2Vjb25kcztcclxuICAgICAgICBlbWl0KCduZXdTZWNvbmQnKTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiLyogZ2xvYmFsIFByb21wdGVyICovXHJcbnZhciBwYXJzZUlucHV0ID0gcmVxdWlyZSgnLi9wYXJzZUlucHV0LmpzJyk7XHJcbnZhciB0b1N0ciA9IHJlcXVpcmUoJy4vY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzJyk7XHJcbnZhciBmb250Rm9ybWF0ID0gcmVxdWlyZShcIi4vZm9udEZvcm1hdC5qc1wiKTtcclxudmFyIGVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XHJcblxyXG52YXIgVmlldyA9IGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgJGJvZHkgPSB3aW5kb3cuVG1yLiRib2R5O1xyXG5cdHZhciAkaW5wdXRUaW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0I3RpbWVcIik7XHJcblx0dmFyICR0aW1lT25NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aW1lX2xlZnRcIik7XHJcblx0dmFyICR0aW1lT25Qcm9tcHRlciA9IG51bGw7XHJcblx0dmFyIHRlbXAgPSB1bmRlZmluZWQ7XHJcblx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdHRoaXMuZW1pdCA9IGVtaXQ7XHJcblx0XHJcblx0dGhpcy5fdGltZXJTdGFydGVkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHdpbmRvdy5UbXIuc3RhdGUudGltZXJTZXQoZXZlbnQuZGV0YWlsLnR5cGUpO1xyXG5cdFx0dGhhdC5fc2hvd1RpbWUoZXZlbnQpO1xyXG5cdFx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSkge1xyXG5cdFx0XHRjYXNlIFwidXBcIjpcclxuXHRcdFx0Y2FzZSBcImRkbG5cIjpcclxuXHRcdFx0XHQkaW5wdXRUaW1lLnZhbHVlID0gZXZlbnQuZGV0YWlsLmRlYWRsaW5lOyAgIFxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0JGlucHV0VGltZS52YWx1ZSA9IGV2ZW50LmRldGFpbC50aW1lO1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuX3RpbWVyUGF1c2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHdpbmRvdy5UbXIuc3RhdGUudGltZXJTZXQoZXZlbnQuZGV0YWlsLnR5cGUgKyBcIi1wYXVzZWRcIik7ICAgICAgICAgICAgICBcclxuXHRcdHRoYXQuX3Nob3dUaW1lKGV2ZW50KVxyXG5cdH1cclxuXHR0aGlzLl90aW1lclJ1biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR3aW5kb3cuVG1yLnN0YXRlLnRpbWVyU2V0KGV2ZW50LmRldGFpbC50eXBlKTtcclxuXHRcdHRoYXQuX3Nob3dUaW1lKGV2ZW50KVxyXG5cdH1cclxuXHR0aGlzLl90aW1lckNhbmNlbGxlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR3aW5kb3cuVG1yLnN0YXRlLnRpbWVyU2V0KFwibm8tdGltZXJcIik7XHJcblx0XHR3aW5kb3cuVG1yLnN0YXRlLnRpbWVyU2V0T3ZlcihcIm5vcGVcIik7XHJcblx0XHQkdGltZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQgPSAkdGltZU9uTWFpbi50ZXh0Q29udGVudCA9IFwiXCI7XHJcblx0ICAgICRpbnB1dFRpbWUudmFsdWUgPSBcIlwiO1xyXG5cdH1cclxuXHR0aGlzLl90aW1lT3ZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR3aW5kb3cuVG1yLnN0YXRlLnRpbWVyU2V0T3ZlcihcIm92ZXJcIik7XHJcblx0XHR0aGF0Ll9zaG93VGltZShldmVudClcclxuXHR9XHJcblx0dGhpcy5fc2hvd1RpbWUgPSBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZiAod2luZG93LlRtci5zdGF0ZS5fcHJvbXB0ZXJTdCA9PT0gXCJwcm9tcHRlci1vblwiKSB7XHJcblx0XHRcdHZhciBmb250ID0gZm9udEZvcm1hdChldmVudCk7XHJcbiAgICAgICAgICAgICR0aW1lT25Qcm9tcHRlci5zdHlsZS5mb250U2l6ZSA9IGZvbnQuc2l6ZTtcclxuXHRcdFx0JHRpbWVPblByb21wdGVyLnN0eWxlLmNvbG9yXHJcblx0XHRcdFx0PSAkdGltZU9uTWFpbi5zdHlsZS5jb2xvciA9IGZvbnQuY29sb3I7XHJcblx0XHRcdCR0aW1lT25Qcm9tcHRlci50ZXh0Q29udGVudFxyXG5cdFx0XHRcdD0gJHRpbWVPbk1haW4udGV4dENvbnRlbnQgPSBldmVudC5kZXRhaWwudGltZTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdCAgICBcdHRoYXQuZW1pdChcIm9wZW5Qcm9tcHRlcldpbmRvd1wiKTtcclxuXHRcdFx0dGVtcCA9IGV2ZW50O1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLl9vbldpbmRvd0NyZWF0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHQkdGltZU9uUHJvbXB0ZXIgPSB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LmRvY3VtZW50XHJcblx0XHRcdC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVfbGVmdFwiKTtcclxuXHRcdGlmKHRlbXApIHtcclxuXHRcdFx0dGhhdC5fc2hvd1RpbWUodGVtcCk7XHJcblx0XHRcdHRlbXAgPSB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuX29uV2luZG93Q2xvc2UgPSBmdW5jdGlvbigpe1xyXG5cdFx0JHRpbWVPblByb21wdGVyID0gbnVsbDtcclxuXHR9XHJcblx0JGlucHV0VGltZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIHZhciBpbnB1dCA9IHBhcnNlSW5wdXQoKTtcclxuXHQgICAgaWYgKGlucHV0LmlzVmFsaWQpICRpbnB1dFRpbWUudmFsdWUgPSB0b1N0cihpbnB1dC52YWx1ZSk7XHJcblx0fSk7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJTdGFydGVkJywgdGhhdC5fdGltZXJTdGFydGVkKTtcclxuXHQkYm9keS5hZGRFdmVudExpc3RlbmVyKCd0aW1lckNoYW5nZWQnLCB0aGF0Ll9zaG93VGltZSk7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJQYXVzZWQnLCB0aGF0Ll90aW1lclBhdXNlZCk7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJSdW4nLCB0aGF0Ll90aW1lclJ1bik7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJDYW5jZWxsZWQnLCB0aGF0Ll90aW1lckNhbmNlbGxlZCk7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZU92ZXInLCB0aGF0Ll90aW1lT3Zlcik7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigncHJvbXB0ZXJXaW5kb3dDcmVhdGVkJywgdGhhdC5fb25XaW5kb3dDcmVhdGUpO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb21wdGVyV2luZG93Q2xvc2VkJywgdGhhdC5fb25XaW5kb3dDbG9zZSk7XHJcblx0d2luZG93LlRtci5zdGF0ZS5fc2VuZCgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
