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
var parseInput = require('./parseInput.js');
var toStr = require('./convertTimeFromSecondsToString.js');

module.exports = function (event) {
	var fontColor = "";
	var timeLeftSeconds = Infinity;
	switch (event.detail.type){
		case "up":
			if(event.detail.deadline !== "0:00"){
				timeLeftSeconds = parseInput(event.detail.deadline).value
					- event.detail.time;
			}
			break
		case "down":
		case "ddln":
			timeLeftSeconds = event.detail.time;
			break
	}
	if(timeLeftSeconds > 120){
		fontColor = "";
	} else if (timeLeftSeconds > 60) {
		fontColor = "#ffa500";
	} else if (timeLeftSeconds >= 0) {
		fontColor = "#f00";
	} else {
		fontColor = "#cc0066";
	}
	if(event.detail.type === "up"){
		timeLeftSeconds = event.detail.time;
	}
	var time = toStr(timeLeftSeconds);
    var fontSize = undefined;
    var minFontSize = 23;
    var maxFontSize = 40;
    var minStringLength = 4;
    var maxStringLength = 8;
    fontSize = Math.floor(minFontSize + (maxStringLength - time.length)
        * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));
    console.log("fontFormat: " + timeLeftSeconds + ", time: " + time);

	return {
		color: fontColor,
		size: fontSize + 'vw',
		time: time
	}
}

},{"./convertTimeFromSecondsToString.js":2,"./parseInput.js":9}],6:[function(require,module,exports){
window.onload = function () {
    var Controller = require('./controller.js');
    var PrompterWindowController = require("./prompterWindowCtrl.js");
	var View = require("./view.js");
    var Messenger = require("./messenger.js");
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
    
	var timerController = new Controller();
    var prompterWindowController = new PrompterWindowController();
	var timerView = new View();
    var messengerView = new Messenger();
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
var convertToString = require("./convertTimeFromSecondsToString.js");
var emit = require("./emitEvent");

var Timer = function (typeOfTimer, enteredTimeInSeconds) {
	var that = this;
	this.emit = emit;
	this.type = typeOfTimer;
	switch (typeOfTimer){
		case "up":
			this.timerValue = 0;
			this.deadline = enteredTimeInSeconds;
			this.timeLeft = function (){
				that.timerValue++;
				that.emit('timerChanged', customDetail());
				if(that.timerValue === that.deadline && that.deadline) {
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
			this.timerValue = (enteredTimeInSeconds) ? enteredTimeInSeconds
				: 3599;
			this.deadline = 0;
			this.timeLeft = function (){
				that.timerValue--;
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
			var enteredTime = convertToString(enteredTimeInSeconds, true);
			this.deadline = new Date();
			this.deadline.setHours(+enteredTime.substring(0, 2));
			this.deadline.setMinutes(+enteredTime.substring(3, 5));
			this.deadline.setSeconds(+enteredTime.substring(6));
			if (this.deadline < new Date()) {
				this.deadline.setDate(this.deadline.getDate() + 1);
			}
			this.deadline.fromDateToString = function() {
				return (that.deadline.getHours()+':'+that.deadline.getMinutes()
					+ ':' + that.deadline.getSeconds());
			}
			this.timerValue = Math.floor((this.deadline - new Date()) / 1000);
			this.timeLeft = function () {
				that.timerValue = Math.floor((that.deadline - new Date())/1000);
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
				time: that.timerValue,
				deadline: (typeOfTimer === "ddln") ? 
				that.deadline.fromDateToString() : convertToString(that.deadline)
			}
		}	
	} 
}

module.exports = Timer;
},{"./convertTimeFromSecondsToString.js":2,"./emitEvent":4}],9:[function(require,module,exports){
module.exports = function (timeString) {
    var $inputTime = document.querySelector("input#time");
    if (!timeString) {
        timeString = ($inputTime.value
            ? $inputTime.value : 0);
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
                $inputTime.value("ЧЧ:ММ:СС'");
                return result
            }
            if (timeString[i] !== ":") {
                timeNumber = timeNumber * 10 + (+timeString[i]);
            }
        }
    } else timeNumber = timeString;

    var hours = Math.floor(timeNumber / 10000);
    if (hours > 23) {
        $inputTime.value("ЧЧ > 23");
        return result
    }
    var minutes = Math.floor((timeNumber - hours * 10000) / 100);
    if (minutes > 59) {
        $inputTime.value("ММ > 59");
        return result
    }
    var seconds = Math.floor(timeNumber - hours * 10000 - minutes * 100);
    if (seconds > 59) {
        $inputTime.value("СС > 59");
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
				$inputTime.value = toStr(event.detail.time);
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
			var format = fontFormat(event);
            $timeOnPrompter.style.fontSize = format.size;
			$timeOnPrompter.style.color
				= $timeOnMain.style.color = format.color;
			$timeOnPrompter.textContent
				= $timeOnMain.textContent = format.time;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb250cm9sbGVyLmpzIiwianMvY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzIiwianMvY3V0Q29udGVudFRvRml0RGl2LmpzIiwianMvZW1pdEV2ZW50LmpzIiwianMvZm9udEZvcm1hdC5qcyIsImpzL21haW4uanMiLCJqcy9tZXNzZW5nZXIuanMiLCJqcy9tb2RlbC5qcyIsImpzL3BhcnNlSW5wdXQuanMiLCJqcy9wcm9tcHRlcldpbmRvd0N0cmwuanMiLCJqcy9zZWNvbmRzRXZlbnRFbWl0dGVyLmpzIiwianMvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRpbWVyID0gcmVxdWlyZSgnLi9tb2RlbC5qcycpO1xyXG52YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG5cclxudmFyIENvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJGJ1dHRvbkNvdW50VXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI3VwXCIpO1xyXG4gICAgdmFyICRidXR0b25Db3VudERvd24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2Rvd25cIik7XHJcbiAgICB2YXIgJGJ1dHRvbkNvdW50RGVhZGxpbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2RlYWRsaW5lXCIpO1xyXG4gICAgdmFyICRidXR0b25SZXNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24jcmVzZXRcIik7XHJcblx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdHRoaXMuX3RpbWVyID0gbnVsbDtcclxuXHR0aGlzLl9idXR0b25DbGlja1Byb2Nlc3NpbmcgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdHZhciBpbnB1dCA9IHBhcnNlSW5wdXQoKTtcclxuXHRcdGlmKCFpbnB1dC5pc1ZhbGlkKSByZXR1cm47XHJcblx0XHRzd2l0Y2ggKGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50KSB7XHJcblx0XHRcdGNhc2UgJGJ1dHRvbkNvdW50VXAgOlxyXG5cdFx0XHRcdGlmKCF0aGF0Ll90aW1lcil7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lciA9IG5ldyBUaW1lcihcInVwXCIsIGlucHV0LnZhbHVlKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoYXQuX3RpbWVyLnR5cGUgPT09IFwidXBcIiAmJiAhdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5wYXVzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJ1cFwiICYmIHRoYXQuX3RpbWVyLnBhdXNlZCkge1xyXG5cdFx0XHRcdFx0dGhhdC5fdGltZXIucnVuKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgJGJ1dHRvbkNvdW50RG93biA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiZG93blwiLCBpbnB1dC52YWx1ZSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGF0Ll90aW1lci50eXBlID09PSBcImRvd25cIiAmJiAhdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5wYXVzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhhdC5fdGltZXIudHlwZSA9PT0gXCJkb3duXCIgJiYgdGhhdC5fdGltZXIucGF1c2VkKSB7XHJcblx0XHRcdFx0XHR0aGF0Ll90aW1lci5ydW4oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdFx0Y2FzZSAkYnV0dG9uQ291bnREZWFkbGluZSA6XHJcblx0XHRcdFx0aWYoIXRoYXQuX3RpbWVyKXtcclxuXHRcdFx0XHRcdHRoYXQuX3RpbWVyID0gbmV3IFRpbWVyKFwiZGRsblwiLCBpbnB1dC52YWx1ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgJGJ1dHRvblJlc2V0IDpcclxuXHRcdFx0XHRpZiAodGhhdC5fdGltZXIpIHRoYXQuX3RpbWVyLmNhbmNlbCgpO1xyXG5cdFx0XHRcdHRoYXQuX3RpbWVyID0gbnVsbDtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cdH1cclxuXHR3aW5kb3cuVG1yLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGF0Ll9idXR0b25DbGlja1Byb2Nlc3NpbmcpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXI7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGltZUluU2Vjb25kcywgZnVsbEZvcm1hdCkge1xyXG4gICAgdmFyIHNpZ24gPSAodGltZUluU2Vjb25kcyA8IDApID8gXCItXCIgOiBcIlwiO1xyXG4gICAgdGltZUluU2Vjb25kcyA9IE1hdGguYWJzKHRpbWVJblNlY29uZHMpO1xyXG4gICAgdmFyIGggPSBNYXRoLmZsb29yKHRpbWVJblNlY29uZHMgLyAoMzYwMCkpO1xyXG4gICAgdmFyIG0gPSBNYXRoLmZsb29yKCh0aW1lSW5TZWNvbmRzIC0gaCAqIDM2MDApIC8gNjApO1xyXG4gICAgdmFyIHMgPSBNYXRoLmZsb29yKHRpbWVJblNlY29uZHMgLSBoICogMzYwMCAtIG0gKiA2MCk7XHJcbiAgICB2YXIgdGltZVN0cmluZyA9IFwiOlwiICsgKHMgPCAxMCA/IFwiMFwiICsgcyA6IHMpO1xyXG4gICAgaWYoZnVsbEZvcm1hdCl7XHJcbiAgICAgICAgdGltZVN0cmluZyA9IChoIDwgMTAgPyBcIjBcIiArIGggOiBoKSArIFwiOlwiICsgKG0gPCAxMCA/IFwiMFwiICsgbSA6IG0pICsgdGltZVN0cmluZztcclxuICAgIH1lbHNlIHtcclxuICAgICAgICBpZiAoaCA+IDApIHtcclxuICAgICAgICAgICAgdGltZVN0cmluZyA9IGggKyBcIjpcIiArIChtIDwgMTAgPyBcIjBcIiArIG0gOiBtKSArIHRpbWVTdHJpbmc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGltZVN0cmluZyA9IG0gKyB0aW1lU3RyaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKFwiY29udmVydDogXCIgKyBzaWduICsgdGltZVN0cmluZyk7XHJcbiAgICByZXR1cm4gc2lnbiArIHRpbWVTdHJpbmc7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJG1lc3NhZ2VPblByb21wdGVyLCAkbWVzc2FnZU9uTWFpbikge1xyXG5cdHZhciB0ZW1wID0gJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50O1xyXG5cdCRtZXNzYWdlT25Qcm9tcHRlci50ZXh0Q29udGVudCA9IFwiXCI7XHJcblx0dmFyIHNjcm9sbEhlaWdodCA9ICRtZXNzYWdlT25Qcm9tcHRlci5zY3JvbGxIZWlnaHQsXHJcblx0XHR0b2dnbGUgPSB0cnVlO1xyXG5cdHZhciBpZCA9IHNldEludGVydmFsKGN1dENvbnRlbnRUb0ZpdERpdiwgNCk7XHJcblx0ZnVuY3Rpb24gY3V0Q29udGVudFRvRml0RGl2KCkge1xyXG5cdFx0aWYodG9nZ2xlKXtcclxuXHRcdFx0JG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50ID0gdGVtcDtcclxuXHRcdFx0dG9nZ2xlID0gZmFsc2U7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZigkbWVzc2FnZU9uUHJvbXB0ZXIuc2Nyb2xsSGVpZ2h0ID4gc2Nyb2xsSGVpZ2h0KXtcclxuXHRcdFx0XHR0ZW1wID0gJG1lc3NhZ2VPblByb21wdGVyLnRleHRDb250ZW50LnNsaWNlKDAsIC0xKTtcclxuXHRcdFx0XHR0b2dnbGUgPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoaWQpO1xyXG5cdFx0XHRcdCRtZXNzYWdlT25NYWluLnRleHRDb250ZW50ID0gdGVtcDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgY3VzdG9tRXZlbnRJbml0KSB7XHJcbiAgICB2YXIgZXZudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIGN1c3RvbUV2ZW50SW5pdCk7XHJcbiAgICB3aW5kb3cuVG1yLiRib2R5LmRpc3BhdGNoRXZlbnQoZXZudCk7XHJcbn0iLCJ2YXIgcGFyc2VJbnB1dCA9IHJlcXVpcmUoJy4vcGFyc2VJbnB1dC5qcycpO1xyXG52YXIgdG9TdHIgPSByZXF1aXJlKCcuL2NvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHR2YXIgZm9udENvbG9yID0gXCJcIjtcclxuXHR2YXIgdGltZUxlZnRTZWNvbmRzID0gSW5maW5pdHk7XHJcblx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSl7XHJcblx0XHRjYXNlIFwidXBcIjpcclxuXHRcdFx0aWYoZXZlbnQuZGV0YWlsLmRlYWRsaW5lICE9PSBcIjA6MDBcIil7XHJcblx0XHRcdFx0dGltZUxlZnRTZWNvbmRzID0gcGFyc2VJbnB1dChldmVudC5kZXRhaWwuZGVhZGxpbmUpLnZhbHVlXHJcblx0XHRcdFx0XHQtIGV2ZW50LmRldGFpbC50aW1lO1xyXG5cdFx0XHR9XHJcblx0XHRcdGJyZWFrXHJcblx0XHRjYXNlIFwiZG93blwiOlxyXG5cdFx0Y2FzZSBcImRkbG5cIjpcclxuXHRcdFx0dGltZUxlZnRTZWNvbmRzID0gZXZlbnQuZGV0YWlsLnRpbWU7XHJcblx0XHRcdGJyZWFrXHJcblx0fVxyXG5cdGlmKHRpbWVMZWZ0U2Vjb25kcyA+IDEyMCl7XHJcblx0XHRmb250Q29sb3IgPSBcIlwiO1xyXG5cdH0gZWxzZSBpZiAodGltZUxlZnRTZWNvbmRzID4gNjApIHtcclxuXHRcdGZvbnRDb2xvciA9IFwiI2ZmYTUwMFwiO1xyXG5cdH0gZWxzZSBpZiAodGltZUxlZnRTZWNvbmRzID49IDApIHtcclxuXHRcdGZvbnRDb2xvciA9IFwiI2YwMFwiO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRmb250Q29sb3IgPSBcIiNjYzAwNjZcIjtcclxuXHR9XHJcblx0aWYoZXZlbnQuZGV0YWlsLnR5cGUgPT09IFwidXBcIil7XHJcblx0XHR0aW1lTGVmdFNlY29uZHMgPSBldmVudC5kZXRhaWwudGltZTtcclxuXHR9XHJcblx0dmFyIHRpbWUgPSB0b1N0cih0aW1lTGVmdFNlY29uZHMpO1xyXG4gICAgdmFyIGZvbnRTaXplID0gdW5kZWZpbmVkO1xyXG4gICAgdmFyIG1pbkZvbnRTaXplID0gMjM7XHJcbiAgICB2YXIgbWF4Rm9udFNpemUgPSA0MDtcclxuICAgIHZhciBtaW5TdHJpbmdMZW5ndGggPSA0O1xyXG4gICAgdmFyIG1heFN0cmluZ0xlbmd0aCA9IDg7XHJcbiAgICBmb250U2l6ZSA9IE1hdGguZmxvb3IobWluRm9udFNpemUgKyAobWF4U3RyaW5nTGVuZ3RoIC0gdGltZS5sZW5ndGgpXHJcbiAgICAgICAgKiAobWF4Rm9udFNpemUgLSBtaW5Gb250U2l6ZSkgLyAobWF4U3RyaW5nTGVuZ3RoIC0gbWluU3RyaW5nTGVuZ3RoKSk7XHJcbiAgICBjb25zb2xlLmxvZyhcImZvbnRGb3JtYXQ6IFwiICsgdGltZUxlZnRTZWNvbmRzICsgXCIsIHRpbWU6IFwiICsgdGltZSk7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRjb2xvcjogZm9udENvbG9yLFxyXG5cdFx0c2l6ZTogZm9udFNpemUgKyAndncnLFxyXG5cdFx0dGltZTogdGltZVxyXG5cdH1cclxufVxyXG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIuanMnKTtcclxuICAgIHZhciBQcm9tcHRlcldpbmRvd0NvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9wcm9tcHRlcldpbmRvd0N0cmwuanNcIik7XHJcblx0dmFyIFZpZXcgPSByZXF1aXJlKFwiLi92aWV3LmpzXCIpO1xyXG4gICAgdmFyIE1lc3NlbmdlciA9IHJlcXVpcmUoXCIuL21lc3Nlbmdlci5qc1wiKTtcclxuICAgIHJlcXVpcmUoJy4vc2Vjb25kc0V2ZW50RW1pdHRlci5qcycpO1xyXG5cclxuICAgIHdpbmRvdy5UbXIgPSB7XHJcbiAgICAgICAgJGJvZHk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLFxyXG4gICAgICAgIHByb21wdGVyV2luZG93OiBudWxsLFxyXG4gICAgICAgIHN0YXRlOiB7XHJcbiAgICAgICAgICAgIF9wcm9tcHRlclN0OiBcInByb21wdGVyLW9mZlwiLFxyXG4gICAgICAgICAgICBwcm9tcHRlclNldDogZnVuY3Rpb24oc3RyKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0cj09PVwicHJvbXB0ZXItb2ZmXCIgfHwgc3RyPT09XCJwcm9tcHRlci1vblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRtci5zdGF0ZS5fcHJvbXB0ZXJTdCA9IHN0cjtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVG1yLnN0YXRlLl9zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgdGhyb3cgRXJyb3I7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF90aW1lclN0OiBcIm5vLXRpbWVyXCIsXHJcbiAgICAgICAgICAgIHRpbWVyU2V0OiBmdW5jdGlvbihzdHIpe1xyXG4gICAgICAgICAgICAgICAgaWYoc3RyPT09XCJ1cFwiIHx8IHN0cj09PVwidXAtcGF1c2VkXCJcclxuICAgICAgICAgICAgICAgIHx8IHN0cj09PVwiZG93blwiIHx8IHN0cj09PVwiZG93bi1wYXVzZWRcIlxyXG4gICAgICAgICAgICAgICAgfHwgc3RyPT09XCJkZGxuXCIgfHwgc3RyPT09XCJuby10aW1lclwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRtci5zdGF0ZS5fdGltZXJTdCA9IHN0cjtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVG1yLnN0YXRlLl9zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgdGhyb3cgRXJyb3I7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF90aW1lck92ZXI6IFwibm9wZVwiLFxyXG4gICAgICAgICAgICB0aW1lclNldE92ZXI6IGZ1bmN0aW9uKHN0cil7XHJcbiAgICAgICAgICAgICAgICBpZihzdHI9PT1cIm5vcGVcIiB8fCBzdHI9PT1cIm92ZXJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UbXIuc3RhdGUuX3RpbWVyT3ZlciA9IHN0cjtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVG1yLnN0YXRlLl9zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgdGhyb3cgRXJyb3I7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF9zZW5kOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgd2luZG93LlRtci4kYm9keS5jbGFzc05hbWUgPSB3aW5kb3cuVG1yLnN0YXRlLl9wcm9tcHRlclN0ICsgXCIgXCIgXHJcbiAgICAgICAgICAgICAgICArIHdpbmRvdy5UbXIuc3RhdGUuX3RpbWVyU3QgKyBcIiBcIiArIHdpbmRvdy5UbXIuc3RhdGUuX3RpbWVyT3ZlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuXHR2YXIgdGltZXJDb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTtcclxuICAgIHZhciBwcm9tcHRlcldpbmRvd0NvbnRyb2xsZXIgPSBuZXcgUHJvbXB0ZXJXaW5kb3dDb250cm9sbGVyKCk7XHJcblx0dmFyIHRpbWVyVmlldyA9IG5ldyBWaWV3KCk7XHJcbiAgICB2YXIgbWVzc2VuZ2VyVmlldyA9IG5ldyBNZXNzZW5nZXIoKTtcclxufSIsInZhciBjdXRDb250ZW50VG9GaXQgPSByZXF1aXJlKFwiLi9jdXRDb250ZW50VG9GaXREaXYuanNcIik7XHJcbnZhciBlbWl0ID0gcmVxdWlyZShcIi4vZW1pdEV2ZW50XCIpO1xyXG5cclxudmFyIE1lc3NlbmdlciA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciAkaW5wdXRNZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInRleHRhcmVhI21lc3NhZ2VcIik7XHJcblx0dmFyICRtZXNzYWdlT25NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIik7ICAgICAgICAgICBcclxuXHR2YXIgJG1lc3NhZ2VPblByb21wdGVyID0gbnVsbDtcclxuXHR2YXIgdGhhdCA9IHRoaXM7XHJcblx0dGhpcy5lbWl0ID0gZW1pdDtcdFxyXG5cdHRoaXMuX3Byb2Nlc3NNZXNzYWdlID0gZnVuY3Rpb24gKCkge1xyXG5cdCAgICBpZiAod2luZG93LlRtci5zdGF0ZS5fcHJvbXB0ZXJTdCA9PT0gXCJwcm9tcHRlci1vblwiKSB7XHJcblx0XHRcdGlmICghJG1lc3NhZ2VPblByb21wdGVyKSB7XHJcblx0XHRcdFx0JG1lc3NhZ2VPblByb21wdGVyID0gd2luZG93LlRtci5wcm9tcHRlcldpbmRvd1xyXG5cdFx0XHRcdFx0LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjbWVzc2FnZV9zaG93XCIpOyBcclxuXHRcdFx0fVxyXG5cdCAgICAgICAgdGhhdC5fc2hvd01lc3NhZ2UoKTtcclxuXHQgICAgfSBlbHNlIHtcclxuXHRcdFx0JG1lc3NhZ2VPblByb21wdGVyID0gbnVsbDtcclxuXHQgICAgXHR0aGF0LmVtaXQoXCJvcGVuUHJvbXB0ZXJXaW5kb3dcIik7XHJcblx0ICAgIH1cclxuXHR9XHJcblx0dGhpcy5fc2hvd01lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHQkbWVzc2FnZU9uUHJvbXB0ZXIudGV4dENvbnRlbnQgPSAkbWVzc2FnZU9uTWFpbi50ZXh0Q29udGVudFxyXG5cdFx0XHQ9ICRpbnB1dE1lc3NhZ2UudmFsdWU7XHJcblx0XHQkaW5wdXRNZXNzYWdlLnZhbHVlID0gXCJcIjtcclxuXHRcdGN1dENvbnRlbnRUb0ZpdCgkbWVzc2FnZU9uUHJvbXB0ZXIsICRtZXNzYWdlT25NYWluKTtcclxuXHR9XHJcblx0dGhpcy5fcHJvY2Vzc0tleURvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHQgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcblx0ICAgICAgICB0aGF0Ll9wcm9jZXNzTWVzc2FnZSgpO1xyXG5cdCAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHQgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAyNykge1xyXG5cdFx0XHQkaW5wdXRNZXNzYWdlLnZhbHVlID0gXCJcIjtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl93aW5kb3dDcmVhdGVkID0gZnVuY3Rpb24oKXtcclxuXHRcdCRtZXNzYWdlT25Qcm9tcHRlciA9IHdpbmRvdy5UbXIucHJvbXB0ZXJXaW5kb3dcclxuXHRcdFx0LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjbWVzc2FnZV9zaG93XCIpO1xyXG5cdFx0aWYoJGlucHV0TWVzc2FnZS52YWx1ZSkgdGhhdC5fc2hvd01lc3NhZ2UoKTtcclxuXHR9XHJcblx0dGhpcy5fd2luZG93Q2xvc2VkID0gZnVuY3Rpb24oKXtcclxuXHRcdCRtZXNzYWdlT25Qcm9tcHRlciA9IG51bGw7XHJcblx0XHQkbWVzc2FnZU9uTWFpbi50ZXh0Q29udGVudCA9IFwiXCI7XHJcblx0fVxyXG5cdCRpbnB1dE1lc3NhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhhdC5fcHJvY2Vzc0tleURvd24pO1xyXG5cdHdpbmRvdy5UbXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigncHJvbXB0ZXJXaW5kb3dDcmVhdGVkJ1xyXG5cdFx0LCB0aGF0Ll93aW5kb3dDcmVhdGVkKTtcclxuXHR3aW5kb3cuVG1yLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb21wdGVyV2luZG93Q2xvc2VkJ1xyXG5cdFx0LCB0aGF0Ll93aW5kb3dDbG9zZWQpO1xyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gTWVzc2VuZ2VyOyIsInZhciBjb252ZXJ0VG9TdHJpbmcgPSByZXF1aXJlKFwiLi9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanNcIik7XG52YXIgZW1pdCA9IHJlcXVpcmUoXCIuL2VtaXRFdmVudFwiKTtcblxudmFyIFRpbWVyID0gZnVuY3Rpb24gKHR5cGVPZlRpbWVyLCBlbnRlcmVkVGltZUluU2Vjb25kcykge1xuXHR2YXIgdGhhdCA9IHRoaXM7XG5cdHRoaXMuZW1pdCA9IGVtaXQ7XG5cdHRoaXMudHlwZSA9IHR5cGVPZlRpbWVyO1xuXHRzd2l0Y2ggKHR5cGVPZlRpbWVyKXtcblx0XHRjYXNlIFwidXBcIjpcblx0XHRcdHRoaXMudGltZXJWYWx1ZSA9IDA7XG5cdFx0XHR0aGlzLmRlYWRsaW5lID0gZW50ZXJlZFRpbWVJblNlY29uZHM7XG5cdFx0XHR0aGlzLnRpbWVMZWZ0ID0gZnVuY3Rpb24gKCl7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZSsrO1xuXHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVyQ2hhbmdlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0aWYodGhhdC50aW1lclZhbHVlID09PSB0aGF0LmRlYWRsaW5lICYmIHRoYXQuZGVhZGxpbmUpIHtcblx0XHRcdFx0XHQvLyB0aGF0LnBhdXNlKCk7XG5cdFx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lT3ZlcicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHdpbmRvdy5UbXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclBhdXNlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0d2luZG93LlRtci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclJ1bicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBcImRvd25cIjpcblx0XHRcdHRoaXMudGltZXJWYWx1ZSA9IChlbnRlcmVkVGltZUluU2Vjb25kcykgPyBlbnRlcmVkVGltZUluU2Vjb25kc1xuXHRcdFx0XHQ6IDM1OTk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lID0gMDtcblx0XHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKXtcblx0XHRcdFx0dGhhdC50aW1lclZhbHVlLS07XG5cdFx0XHRcdHRoYXQuZW1pdCgndGltZXJDaGFuZ2VkJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0XHRpZih0aGF0LnRpbWVyVmFsdWUgPT09IDApIHtcblx0XHRcdFx0XHQvLyB0aGF0LnBhdXNlKCk7XG5cdFx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lT3ZlcicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHdpbmRvdy5UbXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdFx0XHRcdHRoYXQucGF1c2VkID0gdHJ1ZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclBhdXNlZCcsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucnVuID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0d2luZG93LlRtci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0dGhhdC5wYXVzZWQgPSBmYWxzZTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lclJ1bicsIGN1c3RvbURldGFpbCgpKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSBcImRkbG5cIjpcblx0XHRcdHZhciBlbnRlcmVkVGltZSA9IGNvbnZlcnRUb1N0cmluZyhlbnRlcmVkVGltZUluU2Vjb25kcywgdHJ1ZSk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lID0gbmV3IERhdGUoKTtcblx0XHRcdHRoaXMuZGVhZGxpbmUuc2V0SG91cnMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygwLCAyKSk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lLnNldE1pbnV0ZXMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygzLCA1KSk7XG5cdFx0XHR0aGlzLmRlYWRsaW5lLnNldFNlY29uZHMoK2VudGVyZWRUaW1lLnN1YnN0cmluZyg2KSk7XG5cdFx0XHRpZiAodGhpcy5kZWFkbGluZSA8IG5ldyBEYXRlKCkpIHtcblx0XHRcdFx0dGhpcy5kZWFkbGluZS5zZXREYXRlKHRoaXMuZGVhZGxpbmUuZ2V0RGF0ZSgpICsgMSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmRlYWRsaW5lLmZyb21EYXRlVG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICh0aGF0LmRlYWRsaW5lLmdldEhvdXJzKCkrJzonK3RoYXQuZGVhZGxpbmUuZ2V0TWludXRlcygpXG5cdFx0XHRcdFx0KyAnOicgKyB0aGF0LmRlYWRsaW5lLmdldFNlY29uZHMoKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnRpbWVyVmFsdWUgPSBNYXRoLmZsb29yKCh0aGlzLmRlYWRsaW5lIC0gbmV3IERhdGUoKSkgLyAxMDAwKTtcblx0XHRcdHRoaXMudGltZUxlZnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoYXQudGltZXJWYWx1ZSA9IE1hdGguZmxvb3IoKHRoYXQuZGVhZGxpbmUgLSBuZXcgRGF0ZSgpKS8xMDAwKTtcblx0XHRcdFx0dGhhdC5lbWl0KCd0aW1lckNoYW5nZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdFx0XHRcdGlmICh0aGF0LnRpbWVyVmFsdWUgPT09IDApe1xuXHRcdFx0XHRcdC8vIHdpbmRvdy5UbXIuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJ1xuXHRcdFx0XHRcdC8vIFx0LCB0aGF0LnRpbWVMZWZ0KTtcblx0XHRcdFx0XHR0aGF0LmVtaXQoJ3RpbWVPdmVyJywgY3VzdG9tRGV0YWlsKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHR9XG5cdHRoaXMuY2FuY2VsID0gZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuVG1yLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHRoYXQudGltZUxlZnQpO1xuXHRcdHRoYXQuZW1pdCgndGltZXJDYW5jZWxsZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdH1cblx0dGhpcy5lbWl0KCd0aW1lclN0YXJ0ZWQnLCBjdXN0b21EZXRhaWwoKSk7XG5cdHdpbmRvdy5UbXIuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdGhhdC50aW1lTGVmdCk7XG5cdGZ1bmN0aW9uIGN1c3RvbURldGFpbCgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGV0YWlsOiB7XG5cdFx0XHRcdHR5cGU6IHR5cGVPZlRpbWVyLFxuXHRcdFx0XHR0aW1lOiB0aGF0LnRpbWVyVmFsdWUsXG5cdFx0XHRcdGRlYWRsaW5lOiAodHlwZU9mVGltZXIgPT09IFwiZGRsblwiKSA/IFxuXHRcdFx0XHR0aGF0LmRlYWRsaW5lLmZyb21EYXRlVG9TdHJpbmcoKSA6IGNvbnZlcnRUb1N0cmluZyh0aGF0LmRlYWRsaW5lKVxuXHRcdFx0fVxuXHRcdH1cdFxuXHR9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpbWVTdHJpbmcpIHtcclxuICAgIHZhciAkaW5wdXRUaW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0I3RpbWVcIik7XHJcbiAgICBpZiAoIXRpbWVTdHJpbmcpIHtcclxuICAgICAgICB0aW1lU3RyaW5nID0gKCRpbnB1dFRpbWUudmFsdWVcclxuICAgICAgICAgICAgPyAkaW5wdXRUaW1lLnZhbHVlIDogMCk7XHJcbiAgICB9XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIHZhbHVlOiBOYU4sXHJcbiAgICAgICAgaXNWYWxpZDogZmFsc2VcclxuICAgIH1cclxuICAgIGlmIChpc05hTih0aW1lU3RyaW5nKSkge1xyXG4gICAgICAgIHZhciB2YWxpZENoYXJzID0gWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIFwiOlwiXTtcclxuICAgICAgICB2YXIgdGltZU51bWJlciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lU3RyaW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBpc0NoYXJWYWxpZCA9IHZhbGlkQ2hhcnMuc29tZShmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVTdHJpbmdbaV0gPT0gaXRlbTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaWYgKCFpc0NoYXJWYWxpZCkge1xyXG4gICAgICAgICAgICAgICAgJGlucHV0VGltZS52YWx1ZShcItCn0Kc60JzQnDrQodChJ1wiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGltZVN0cmluZ1tpXSAhPT0gXCI6XCIpIHtcclxuICAgICAgICAgICAgICAgIHRpbWVOdW1iZXIgPSB0aW1lTnVtYmVyICogMTAgKyAoK3RpbWVTdHJpbmdbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHRpbWVOdW1iZXIgPSB0aW1lU3RyaW5nO1xyXG5cclxuICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZU51bWJlciAvIDEwMDAwKTtcclxuICAgIGlmIChob3VycyA+IDIzKSB7XHJcbiAgICAgICAgJGlucHV0VGltZS52YWx1ZShcItCn0KcgPiAyM1wiKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcbiAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoKHRpbWVOdW1iZXIgLSBob3VycyAqIDEwMDAwKSAvIDEwMCk7XHJcbiAgICBpZiAobWludXRlcyA+IDU5KSB7XHJcbiAgICAgICAgJGlucHV0VGltZS52YWx1ZShcItCc0JwgPiA1OVwiKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcbiAgICB2YXIgc2Vjb25kcyA9IE1hdGguZmxvb3IodGltZU51bWJlciAtIGhvdXJzICogMTAwMDAgLSBtaW51dGVzICogMTAwKTtcclxuICAgIGlmIChzZWNvbmRzID4gNTkpIHtcclxuICAgICAgICAkaW5wdXRUaW1lLnZhbHVlKFwi0KHQoSA+IDU5XCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciB0aW1lSW5TZWNvbmRzID0gaG91cnMgKiAzNjAwICsgbWludXRlcyAqIDYwICsgc2Vjb25kcztcclxuICAgIHJldHVybiByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IHRpbWVJblNlY29uZHMsXHJcbiAgICAgICAgaXNWYWxpZDogdHJ1ZVxyXG4gICAgfVxyXG59XHJcbiIsInZhciBXaW5Db250cm9sID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XHJcblx0dGhpcy5fJGJ1dHRvbk9uT2ZmID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNzY3JlZW4yXCIpO1xyXG5cdHZhciB0aGF0ID0gdGhpcztcclxuXHR0aGlzLl9vcGVuV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0ICAgIHZhciBzdHJXaW5kb3dGZWF0dXJlcyA9IFwibWVudWJhcj1ubywgbG9jYXRpb249bm8sIGxvY2F0aW9uYmFyPW5vXCI7XHJcblx0XHRzdHJXaW5kb3dGZWF0dXJlcyArPSBcInRvb2xiYXI9bm8sIHBlcnNvbmFsYmFyPW5vLCBzdGF0dXM9bm9cIjtcclxuXHRcdHN0cldpbmRvd0ZlYXR1cmVzICs9IFwicmVzaXphYmxlPXllcywgc2Nyb2xsYmFycz1ubyxzdGF0dXM9bm9cIjtcclxuXHQgICAgdmFyIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSA9IFwiaGVpZ2h0PTMwMCx3aWR0aD01MDBcIjtcclxuLy9cdFx0dmFyIGxvYyA9IFwiaHR0cDovL3BvdHJhdm5peS5naXRodWIuaW8vXCI7XHJcbi8vXHQgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdyA9IHdpbmRvdy5vcGVuKGxvYyArIFwicHJvbXB0ZXIuaHRtbFwiLCBcInByb21wdGVyXCJcclxuXHQgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdyA9IHdpbmRvdy5vcGVuKFwicHJvbXB0ZXIuaHRtbFwiLFwicHJvbXB0ZXJcIlxyXG5cdFx0XHQsIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSArIFwiLFwiICsgc3RyV2luZG93RmVhdHVyZXMpO1xyXG5cdCAgICBpZighd2luZG93LlRtci5wcm9tcHRlcldpbmRvdykgcmV0dXJuO1xyXG5cdCAgICB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBzdGFydCk7XHJcblx0XHRmdW5jdGlvbiBzdGFydCgpIHtcclxuLy9cdCAgICAgICAgdmFyIHcgPSB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93O1xyXG5cdCAgICAgICAgd2luZG93LlRtci5zdGF0ZS5wcm9tcHRlclNldChcInByb21wdGVyLW9uXCIpO1xyXG5cdFx0ICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnLCB0aGF0Ll9jbG9zZUlmV2luZG93SXMpO1xyXG5cdCAgICAgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnXHJcblx0XHRcdFx0LCB0aGF0Ll9jbG9zZVdpbmRvdyk7XHJcbi8vXHRcdFx0dmFyIGkgPSB0aGF0LmEoKTtcclxuLy9cdFx0XHRpZihpLmwhPT0yNiB8fCBpLnIhPT0yNTU1KXtzZXRUaW1lb3V0KHcuY2xvc2UoKSwgTWF0aC5mbG9vcigxNTAwICsgTWF0aC5yYW5kb20oMzAwMCkpKX1cclxuXHRcdCAgICB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBzdGFydCk7XHJcblx0XHRcdHRoYXQuZW1pdChcInByb21wdGVyV2luZG93Q3JlYXRlZFwiKTtcclxuXHQgICAgfVxyXG5cdH1cclxuXHR0aGlzLl9jbG9zZVdpbmRvdyA9IGZ1bmN0aW9uKCkge1xyXG5cdCAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgdGhhdC5fY2xvc2VJZldpbmRvd0lzKTtcclxuXHQgICAgd2luZG93LlRtci5wcm9tcHRlcldpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd1bmxvYWQnXHJcblx0XHRcdCwgdGhhdC5fY2xvc2VXaW5kb3cpO1xyXG5cdCAgICB3aW5kb3cuVG1yLnByb21wdGVyV2luZG93LmNsb3NlKCk7XHJcblx0XHR3aW5kb3cuVG1yLnByb21wdGVyV2luZG93ID0gbnVsbDtcclxuXHQgICAgd2luZG93LlRtci5zdGF0ZS5wcm9tcHRlclNldChcInByb21wdGVyLW9mZlwiKTtcclxuXHRcdHRoYXQuZW1pdChcInByb21wdGVyV2luZG93Q2xvc2VkXCIpO1xyXG5cdH1cclxuXHR0aGlzLl90b2dnbGVXaW5kb3cgPSBmdW5jdGlvbiAoKSB7XHJcblx0ICAgIGlmICh3aW5kb3cuVG1yLnN0YXRlLl9wcm9tcHRlclN0ID09PSBcInByb21wdGVyLW9uXCIpe1xyXG5cdFx0XHR0aGF0Ll9jbG9zZVdpbmRvdygpO1xyXG5cdFx0fSBlbHNlIHRoYXQuX29wZW5XaW5kb3coKTtcclxuXHR9XHJcblx0dGhpcy5fY2xvc2VJZldpbmRvd0lzID0gZnVuY3Rpb24gKCkge1xyXG5cdCAgICBpZiAod2luZG93LlRtci5zdGF0ZS5fcHJvbXB0ZXJTdCA9PT0gXCJwcm9tcHRlci1vblwiKSB7XHJcblx0XHRcdHRoYXQuX2Nsb3NlV2luZG93KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRoaXMuXyRidXR0b25Pbk9mZi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoYXQuX3RvZ2dsZVdpbmRvdyk7XHJcblx0d2luZG93LlRtci4kYm9keS5hZGRFdmVudExpc3RlbmVyKCdvcGVuUHJvbXB0ZXJXaW5kb3cnXHJcblx0XHQsIHRoYXQuX29wZW5XaW5kb3cpO1xyXG5cdC8vIHRoaXMuYSA9IGZ1bmN0aW9uKCl7XHJcblx0Ly8gXHR2YXIgbyA9IGxvY2F0aW9uLm9yaWdpbjtcclxuXHQvLyBcdHZhciByID0gMDtcclxuXHQvLyBcdGZvcih2YXIgaT0wOyBpPG8ubGVuZ3RoOyBpKyspIHtcclxuXHQvLyBcdFx0ciArPSBvLmNoYXJDb2RlQXQoaSk7XHJcblx0Ly8gXHR9XHJcblx0Ly8gXHRyZXR1cm4ge1xyXG5cdC8vIFx0XHRyOiByLFxyXG5cdC8vIFx0XHRsOiBvLmxlbmd0aFxyXG5cdC8vIFx0fVxyXG5cdC8vIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IFdpbkNvbnRyb2w7IiwidmFyIGVtaXQgPSByZXF1aXJlKCcuL2VtaXRFdmVudCcpO1xyXG52YXIgY3VycmVudFRpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxudmFyIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbChlbWl0RXZlbnRFdmVyeVNlY29uZCwgMTAwKTtcclxuXHJcbmZ1bmN0aW9uIGVtaXRFdmVudEV2ZXJ5U2Vjb25kKCkge1xyXG4gICAgdmFyIG5ld1RpbWVJblNlY29uZHMgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcclxuICAgIGlmIChjdXJyZW50VGltZUluU2Vjb25kcyAhPT0gbmV3VGltZUluU2Vjb25kcykge1xyXG4gICAgICAgIGN1cnJlbnRUaW1lSW5TZWNvbmRzID0gbmV3VGltZUluU2Vjb25kcztcclxuICAgICAgICBlbWl0KCduZXdTZWNvbmQnKTtcclxuICAgIH1cclxufVxyXG5cclxuIiwiLyogZ2xvYmFsIFByb21wdGVyICovXHJcbnZhciBwYXJzZUlucHV0ID0gcmVxdWlyZSgnLi9wYXJzZUlucHV0LmpzJyk7XHJcbnZhciB0b1N0ciA9IHJlcXVpcmUoJy4vY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nLmpzJyk7XHJcbnZhciBmb250Rm9ybWF0ID0gcmVxdWlyZShcIi4vZm9udEZvcm1hdC5qc1wiKTtcclxudmFyIGVtaXQgPSByZXF1aXJlKFwiLi9lbWl0RXZlbnRcIik7XHJcblxyXG52YXIgVmlldyA9IGZ1bmN0aW9uICgpIHtcclxuXHR2YXIgJGJvZHkgPSB3aW5kb3cuVG1yLiRib2R5O1xyXG5cdHZhciAkaW5wdXRUaW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0I3RpbWVcIik7XHJcblx0dmFyICR0aW1lT25NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aW1lX2xlZnRcIik7XHJcblx0dmFyICR0aW1lT25Qcm9tcHRlciA9IG51bGw7XHJcblx0dmFyIHRlbXAgPSB1bmRlZmluZWQ7XHJcblx0dmFyIHRoYXQgPSB0aGlzO1xyXG5cdHRoaXMuZW1pdCA9IGVtaXQ7XHJcblx0XHJcblx0dGhpcy5fdGltZXJTdGFydGVkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdHdpbmRvdy5UbXIuc3RhdGUudGltZXJTZXQoZXZlbnQuZGV0YWlsLnR5cGUpO1xyXG5cdFx0dGhhdC5fc2hvd1RpbWUoZXZlbnQpO1xyXG5cdFx0c3dpdGNoIChldmVudC5kZXRhaWwudHlwZSkge1xyXG5cdFx0XHRjYXNlIFwidXBcIjpcclxuXHRcdFx0Y2FzZSBcImRkbG5cIjpcclxuXHRcdFx0XHQkaW5wdXRUaW1lLnZhbHVlID0gZXZlbnQuZGV0YWlsLmRlYWRsaW5lOyAgIFxyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0JGlucHV0VGltZS52YWx1ZSA9IHRvU3RyKGV2ZW50LmRldGFpbC50aW1lKTtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLl90aW1lclBhdXNlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHR3aW5kb3cuVG1yLnN0YXRlLnRpbWVyU2V0KGV2ZW50LmRldGFpbC50eXBlICsgXCItcGF1c2VkXCIpOyAgICAgICAgICAgICAgXHJcblx0XHR0aGF0Ll9zaG93VGltZShldmVudClcclxuXHR9XHJcblx0dGhpcy5fdGltZXJSdW4gPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0d2luZG93LlRtci5zdGF0ZS50aW1lclNldChldmVudC5kZXRhaWwudHlwZSk7XHJcblx0XHR0aGF0Ll9zaG93VGltZShldmVudClcclxuXHR9XHJcblx0dGhpcy5fdGltZXJDYW5jZWxsZWQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0d2luZG93LlRtci5zdGF0ZS50aW1lclNldChcIm5vLXRpbWVyXCIpO1xyXG5cdFx0d2luZG93LlRtci5zdGF0ZS50aW1lclNldE92ZXIoXCJub3BlXCIpO1xyXG5cdFx0JHRpbWVPblByb21wdGVyLnRleHRDb250ZW50ID0gJHRpbWVPbk1haW4udGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cdCAgICAkaW5wdXRUaW1lLnZhbHVlID0gXCJcIjtcclxuXHR9XHJcblx0dGhpcy5fdGltZU92ZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0d2luZG93LlRtci5zdGF0ZS50aW1lclNldE92ZXIoXCJvdmVyXCIpO1xyXG5cdFx0dGhhdC5fc2hvd1RpbWUoZXZlbnQpXHJcblx0fVxyXG5cdHRoaXMuX3Nob3dUaW1lID0gZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0aWYgKHdpbmRvdy5UbXIuc3RhdGUuX3Byb21wdGVyU3QgPT09IFwicHJvbXB0ZXItb25cIikge1xyXG5cdFx0XHR2YXIgZm9ybWF0ID0gZm9udEZvcm1hdChldmVudCk7XHJcbiAgICAgICAgICAgICR0aW1lT25Qcm9tcHRlci5zdHlsZS5mb250U2l6ZSA9IGZvcm1hdC5zaXplO1xyXG5cdFx0XHQkdGltZU9uUHJvbXB0ZXIuc3R5bGUuY29sb3JcclxuXHRcdFx0XHQ9ICR0aW1lT25NYWluLnN0eWxlLmNvbG9yID0gZm9ybWF0LmNvbG9yO1xyXG5cdFx0XHQkdGltZU9uUHJvbXB0ZXIudGV4dENvbnRlbnRcclxuXHRcdFx0XHQ9ICR0aW1lT25NYWluLnRleHRDb250ZW50ID0gZm9ybWF0LnRpbWU7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHQgICAgXHR0aGF0LmVtaXQoXCJvcGVuUHJvbXB0ZXJXaW5kb3dcIik7XHJcblx0XHRcdHRlbXAgPSBldmVudDtcclxuXHRcdH1cclxuXHR9XHJcblx0dGhpcy5fb25XaW5kb3dDcmVhdGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0JHRpbWVPblByb21wdGVyID0gd2luZG93LlRtci5wcm9tcHRlcldpbmRvdy5kb2N1bWVudFxyXG5cdFx0XHQucXVlcnlTZWxlY3RvcihcIiN0aW1lX2xlZnRcIik7XHJcblx0XHRpZih0ZW1wKSB7XHJcblx0XHRcdHRoYXQuX3Nob3dUaW1lKHRlbXApO1xyXG5cdFx0XHR0ZW1wID0gdW5kZWZpbmVkO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aGlzLl9vbldpbmRvd0Nsb3NlID0gZnVuY3Rpb24oKXtcclxuXHRcdCR0aW1lT25Qcm9tcHRlciA9IG51bGw7XHJcblx0fVxyXG5cdCRpbnB1dFRpbWUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG5cdCAgICB2YXIgaW5wdXQgPSBwYXJzZUlucHV0KCk7XHJcblx0ICAgIGlmIChpbnB1dC5pc1ZhbGlkKSAkaW5wdXRUaW1lLnZhbHVlID0gdG9TdHIoaW5wdXQudmFsdWUpO1xyXG5cdH0pO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyU3RhcnRlZCcsIHRoYXQuX3RpbWVyU3RhcnRlZCk7XHJcblx0JGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndGltZXJDaGFuZ2VkJywgdGhhdC5fc2hvd1RpbWUpO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyUGF1c2VkJywgdGhhdC5fdGltZXJQYXVzZWQpO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyUnVuJywgdGhhdC5fdGltZXJSdW4pO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVyQ2FuY2VsbGVkJywgdGhhdC5fdGltZXJDYW5jZWxsZWQpO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWVPdmVyJywgdGhhdC5fdGltZU92ZXIpO1xyXG5cdCRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb21wdGVyV2luZG93Q3JlYXRlZCcsIHRoYXQuX29uV2luZG93Q3JlYXRlKTtcclxuXHQkYm9keS5hZGRFdmVudExpc3RlbmVyKCdwcm9tcHRlcldpbmRvd0Nsb3NlZCcsIHRoYXQuX29uV2luZG93Q2xvc2UpO1xyXG5cdHdpbmRvdy5UbXIuc3RhdGUuX3NlbmQoKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyJdfQ==
