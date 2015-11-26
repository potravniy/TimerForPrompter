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