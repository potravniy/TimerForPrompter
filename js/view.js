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