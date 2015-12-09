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