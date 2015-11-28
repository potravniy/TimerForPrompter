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