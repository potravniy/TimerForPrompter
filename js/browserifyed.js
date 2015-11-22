(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (timeInSeconds) {
    var h = Math.floor(timeInSeconds / (3600));
    var m = Math.floor((timeInSeconds - h * 3600) / 60);
    var s = Math.floor(timeInSeconds - h * 3600 - m * 60);
    var timeString = "";
    if (h > 0) {
        timeString = h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    } else {
        timeString = m + ":" + (s < 10 ? "0" + s : s);
    }
    return timeString;
}

},{}],2:[function(require,module,exports){
Timer = require('./timerConstructor.js');
inputValidation = require("./inputValidationFunc.js");
switchTimerOutput = require("./switchTimerOutputFunc.js");
var $divCountDown = document.querySelector("div.count_down");
myVars.$inputAndDisplayTimeCountDown = $divCountDown.querySelector("input#count_down");
var $buttonStartStopCountDown = $divCountDown.querySelector("button.start_stop");
var $buttonResetCountDown = $divCountDown.querySelector("button.reset");
myVars.$buttonShowCountDown = $divCountDown.querySelector("button.show");
var countDownTimer = new Timer();
myVars.$inputAndDisplayTimeCountDown.addEventListener('change', function () {
    inputValidation(myVars.$inputAndDisplayTimeCountDown, countDownTimer);
})
$buttonStartStopCountDown.addEventListener("click", startStopCountDown);
$buttonResetCountDown.addEventListener('click', resetCountDown);
myVars.$buttonShowCountDown.addEventListener('click', switchTimerOutput);

function startStopCountDown() {
    if ($buttonStartStopCountDown.textContent === "Пуск") {
        $buttonStartStopCountDown.textContent = "Пауза";
        myVars.$body.addEventListener('newSecond', updateCountDownTimer);
    } else if ($buttonStartStopCountDown.textContent === "Пауза") {
        $buttonStartStopCountDown.textContent = "Пуск";
        myVars.$body.removeEventListener('newSecond', updateCountDownTimer);
    }
}
function updateCountDownTimer() {
    countDownTimer.decrement();
    myVars.$inputAndDisplayTimeCountDown.value = countDownTimer.toString();
    if (countDownTimer.value === 0) {
        $buttonStartStopCountDown.textContent = "Пуск";
        myVars.$body.removeEventListener('newSecond', updateCountDownTimer);
        myVars.$inputAndDisplayTimeCountDown.style["background-color"] = "red";
    }
}
function resetCountDown() {
    if ($buttonStartStopCountDown.textContent === "Пауза") {
        $buttonStartStopCountDown.textContent = "Пуск";
        myVars.$body.removeEventListener('newSecond', updateCountDownTimer);
    }
    countDownTimer.reset();
    myVars.$inputAndDisplayTimeCountDown.value = "";
    myVars.$inputAndDisplayTimeCountDown.style["background-color"] = "lightblue";
}

},{"./inputValidationFunc.js":6,"./switchTimerOutputFunc.js":10,"./timerConstructor.js":11}],3:[function(require,module,exports){
Timer = require('./timerConstructor.js');
inputValidation = require("./inputValidationFunc.js");
switchTimerOutput = require("./switchTimerOutputFunc.js");
var $divCountUp = document.querySelector("div.count_up");
myVars.$inputAndDisplayTimeCountUp = $divCountUp.querySelector("input#count_up");
var $buttonStartStopCountUp = $divCountUp.querySelector("button.start_stop");
var $buttonResetCountUp = $divCountUp.querySelector("button.reset");
myVars.$buttonShowCountUp = $divCountUp.querySelector("button.show");
var countUpTimer = new Timer();
myVars.$inputAndDisplayTimeCountUp.addEventListener('change', function () {
    inputValidation(myVars.$inputAndDisplayTimeCountUp, countUpTimer);
})
$buttonStartStopCountUp.addEventListener("click", startStopCountUp);
$buttonResetCountUp.addEventListener('click', resetCountUp);
myVars.$buttonShowCountUp.addEventListener('click', switchTimerOutput);

function startStopCountUp() {
    if ($buttonStartStopCountUp.textContent === "Пуск") {
        $buttonStartStopCountUp.textContent = "Пауза";
        myVars.$body.addEventListener('newSecond', updateCountUpTimer);
    } else if ($buttonStartStopCountUp.textContent === "Пауза") {
        $buttonStartStopCountUp.textContent = "Пуск";
        myVars.$body.removeEventListener('newSecond', updateCountUpTimer);
    }
}
function updateCountUpTimer() {
    countUpTimer.increment();
    myVars.$inputAndDisplayTimeCountUp.value = countUpTimer.toString();
}
function resetCountUp() {
    if ($buttonStartStopCountUp.textContent === "Пауза") {
        $buttonStartStopCountUp.textContent = "Пуск";
        myVars.$body.removeEventListener('newSecond', updateCountUpTimer);
    }
    countUpTimer.reset();
    myVars.$inputAndDisplayTimeCountUp.value = "";
}

},{"./inputValidationFunc.js":6,"./switchTimerOutputFunc.js":10,"./timerConstructor.js":11}],4:[function(require,module,exports){
validateInput = require("./validateInputFunc.js");
convertTimeFromSecondsToString = require("./convertTimeFromSecondsToString.js");
var $divDeadline = document.querySelector("div.deadline");
var $inputAndDisplayTimeDeadline = $divDeadline.querySelector("input#deadline");
myVars.$displayTimeLeft = $divDeadline.querySelector("input#deadline_show");
var $buttonResetDeadline = $divDeadline.querySelector("button.reset");
myVars.$buttonShowDeadline = $divDeadline.querySelector("button.show");
var DeadlineTimer = {
    value: undefined,
    reset: function () {
        DeadlineTimer.value = undefined;
    },
    timeLeft: function () {
        var timer = Math.floor((this.value - new Date()) / 1000);
        if (timer < 0) return;
        var h = Math.floor(timer / 3600);
        var m = Math.floor((timer - h * 3600) / 60);
        var s = Math.floor(timer - h * 3600 - m * 60);
        var timerString = "";
        if (h > 0) {
            timerString = h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        } else {
            timerString = m + ":" + (s < 10 ? "0" + s : s);
        }
        return timerString;
    }
};
$inputAndDisplayTimeDeadline.addEventListener('change', function () {
    var deadlineTimeInSeconds = validateInput($inputAndDisplayTimeDeadline);
    if (deadlineTimeInSeconds.isValid) {
        var enteredTime = convertTimeFromSecondsToString(deadlineTimeInSeconds.value);
        if (enteredTime.length === 4) {
            enteredTime = "00:0" + enteredTime;
        } else if (enteredTime.length === 5) {
            enteredTime = "00:" + enteredTime;
        } else if (enteredTime.length === 7) {
            enteredTime = "0" + enteredTime;
        }
        $inputAndDisplayTimeDeadline.value = enteredTime;
        var endTime = new Date();
        endTime.setHours(+enteredTime.substring(0, 2));
        endTime.setMinutes(+enteredTime.substring(3, 5));
        endTime.setSeconds(+enteredTime.substring(6));
        if (endTime < new Date()) {
            endTime.setDate(endTime.getDate() + 1);
        }
        DeadlineTimer.value = endTime;
        myVars.$body.addEventListener('newSecond', updateDeadlineTimer);
    } else {
        resetDeadline();
    }

})
$buttonResetDeadline.addEventListener('click', resetDeadline);
myVars.$buttonShowDeadline.addEventListener('click', switchTimerOutput);

function updateDeadlineTimer() {
    myVars.$displayTimeLeft.value = DeadlineTimer.timeLeft();
    if (myVars.$displayTimeLeft.value === "0:00") {
        myVars.$body.removeEventListener('newSecond', updateDeadlineTimer);
        $inputAndDisplayTimeDeadline.style["background-color"] = "red";
        myVars.$displayTimeLeft.style.color = "red";
    }
}
function resetDeadline() {
    myVars.$body.removeEventListener('newSecond', updateDeadlineTimer);
    DeadlineTimer.reset();
    $inputAndDisplayTimeDeadline.value = "";
    $inputAndDisplayTimeDeadline.style["background-color"] = "lightblue";
    myVars.$displayTimeLeft.value = "";
    myVars.$displayTimeLeft.style.color = "black";
}

},{"./convertTimeFromSecondsToString.js":1,"./validateInputFunc.js":12}],5:[function(require,module,exports){
myVars.$displayMessageString = document.querySelector("div#message_show");
var $inputMessageString = document.querySelector("textarea#message");
$inputMessageString.addEventListener("change", processMessage);
$inputMessageString.addEventListener("keydown", processKeyDown);
function processMessage() {
    if (myVars.$screen2Message) {
        myVars.$displayMessageString.textContent = $inputMessageString.value;
        myVars.$screen2Message.textContent = $inputMessageString.value;
    } else myVars.$displayMessageString.textContent = "Нет окна суфлера";
}
function processKeyDown(event) {
    if (event.keyCode === 13) {
        processMessage();
        event.preventDefault();
    } else if (event.keyCode === 27) {
        myVars.$displayMessageString.textContent = $inputMessageString.value = "";
        processMessage();
    }
}
module.exports = processMessage;

},{}],6:[function(require,module,exports){
validateInput = require("./validateInputFunc.js")
module.exports = function ($input, timer) {
        var input = validateInput($input);
        if (input.isValid) {
            timer.set(input.value);
        }
    }

},{"./validateInputFunc.js":12}],7:[function(require,module,exports){
window.onload = function () {
    window.myVars = {
        $body: document.querySelector("body"),
    }
    require("./countUpTimerModule.js");
    require("./countDownTimerModule.js");
    require("./deadlineTimerModule.js");
    require("./screen2ndModule.js");
    require("./displayMessageModule.js");
    require('./newSecondEventEmitter.js');
}
},{"./countDownTimerModule.js":2,"./countUpTimerModule.js":3,"./deadlineTimerModule.js":4,"./displayMessageModule.js":5,"./newSecondEventEmitter.js":8,"./screen2ndModule.js":9}],8:[function(require,module,exports){
var currentTimeInSeconds = Math.floor(Date.now() / 1000);
var newSecondIntervalID = setInterval(emittEventEverySecond, 100);
function emittEventEverySecond() {
    var newTimeInSeconds = Math.floor(Date.now() / 1000);
    if (currentTimeInSeconds !== newTimeInSeconds) {
        currentTimeInSeconds = newTimeInSeconds;
        var myEvent = new Event('newSecond');
        myVars.$body.dispatchEvent(myEvent);
    }
}


},{}],9:[function(require,module,exports){
processMessage = require("./displayMessageModule.js");
myVars.screen2 = null;
myVars.$screen2Timer = null;
myVars.$screen2Message = null;
$screen2OpenCloseButton = myVars.$body.querySelector("button#screen2");
$screen2OpenCloseButton.addEventListener('click', openCloseScreen2);
function openCloseScreen2() {
    if (myVars.screen2) screen2WindowClose();
    else screen2WindowCreate();
}
function screen2WindowCreate() {
    var strWindowFeatures = "menubar=no, location=no, locationbar=no, toolbar=no, personalbar=no, status=no, resizable=yes, scrollbars=no,status=no";
    var strWindowPositionAndSize = "height=500,width=400";
    myVars.screen2 = window.open("screen2.html", "screen2nd", strWindowPositionAndSize + "," + strWindowFeatures);
    myVars.screen2.addEventListener('load', function () {
        myVars.$screen2Timer = myVars.screen2.document.querySelector("div#time_left");
        myVars.$screen2Message = myVars.screen2.document.querySelector("div#message_show");
        $screen2OpenCloseButton.textContent = "Закрыть окно суфлера";
        processMessage();
        myVars.screen2.addEventListener('unload', function () {
            screen2WindowClose();
            switchTimerOutput(event);
        });
    });
    window.addEventListener('unload', screen2WindowCloseFunc);
}
function screen2WindowCloseFunc() {
    if (myVars.screen2) screen2WindowClose();
}
function screen2WindowClose() {
    window.removeEventListener('unload', screen2WindowCloseFunc);
    myVars.$screen2Timer = null;
    myVars.$screen2Message = null;
    processMessage();
    myVars.screen2.close();
    myVars.screen2 = null;
    $screen2OpenCloseButton.textContent = "Создать окно суфлера";
}

},{"./displayMessageModule.js":5}],10:[function(require,module,exports){
var $displayOutputTimer = document.querySelector("div#time_left");
var currentSourceForOutput = null;
var showTimerIntervalID;
function switchTimerOutput(event) {
    clearInterval(showTimerIntervalID);
    myVars.$buttonShowCountUp.style['background-color'] = myVars.$buttonShowCountDown.style['background-color'] = myVars.$buttonShowDeadline.style['background-color'] = 'buttonface';
    if (!myVars.screen2 || !myVars.$screen2Timer) {
        currentSourceForOutput = null;
        $displayOutputTimer.textContent = "";
        myVars.$displayMessageString.textContent = "Нет окна суфлера";
        return
    }
    switch (event.target || event.srcElement) {
        case myVars.$buttonShowCountUp:
            if (currentSourceForOutput === myVars.$inputAndDisplayTimeCountUp) {
                currentSourceForOutput = null;
                $displayOutputTimer.textContent = "";
                if (myVars.$screen2Timer) myVars.$screen2Timer.textContent = "";
            } else {
                currentSourceForOutput = myVars.$inputAndDisplayTimeCountUp;
                showTimer();
                myVars.$buttonShowCountUp.style['background-color'] = 'lawngreen';
            }
            break
        case myVars.$buttonShowCountDown:
            if (currentSourceForOutput === myVars.$inputAndDisplayTimeCountDown) {
                currentSourceForOutput = null;
                $displayOutputTimer.textContent = "";
                if (myVars.$screen2Timer) myVars.$screen2Timer.textContent = "";
            } else {
                currentSourceForOutput = myVars.$inputAndDisplayTimeCountDown;
                showTimer();
                myVars.$buttonShowCountDown.style['background-color'] = 'lawngreen';
            }
            break
        case myVars.$buttonShowDeadline:
            if (currentSourceForOutput === myVars.$displayTimeLeft) {
                currentSourceForOutput = null;
                $displayOutputTimer.textContent = "";
                if (myVars.$screen2Timer) myVars.$screen2Timer.textContent = "";
            } else {
                currentSourceForOutput = myVars.$displayTimeLeft;
                showTimer();
                myVars.$buttonShowDeadline.style['background-color'] = 'lawngreen';
            }
            break
        case myVars.screen2:
            currentSourceForOutput = null;
            $displayOutputTimer.textContent = "";
    }
    function showTimer() {
        showTimerIntervalID = setInterval(show, 100);
        function show() {
            if (!myVars.$screen2Timer) {
                $displayOutputTimer.textContent = "";
                return
            }
            var minFontSize = 23;
            var maxFontSize = 40;
            var minStringLength = 4;
            var maxStringLength = 8;
            var fontSize = Math.floor(minFontSize + (maxStringLength - currentSourceForOutput.value.length) * (maxFontSize - minFontSize) / (maxStringLength - minStringLength));
            myVars.$screen2Timer.style['font-size'] = fontSize + 'vw';
            $displayOutputTimer.textContent = myVars.$screen2Timer.textContent = currentSourceForOutput.value;
        }
    }
}
module.exports = switchTimerOutput;

},{}],11:[function(require,module,exports){
	var Timer = function () {
        this.value = 0;
        return this
    }
    Timer.prototype.set = function (value) {
        if(!isNaN(value)) this.value = value;
    }
    Timer.prototype.increment = function () {
        this.value++;
    }
    Timer.prototype.decrement = function () {
        if (this.value > 0) this.value--;
    }
    Timer.prototype.reset = function () {
        this.value = 0;
    }
    Timer.prototype.toString = function () {
        return require("./convertTimeFromSecondsToString.js")(this.value);
    }

module.exports = Timer;
},{"./convertTimeFromSecondsToString.js":1}],12:[function(require,module,exports){
module.exports = function ($input) {
    var timeString = ($input.value ? $input.value : 0);
    var result = {
        value: NaN,
        isValid: false
    }
    if (isNaN(timeString)) {
        var validChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ":"];
        var timeNumber = 0;
        for (var i = 0; i < timeString.length; i++) {
            var areValid = validChars.some(function (item) {
                return timeString[i] == item;
            })
            if (!areValid) {
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
    $input.value = require("./convertTimeFromSecondsToString")(timeInSeconds);
    return result = {
        value: timeInSeconds,
        isValid: true
    }
}

},{"./convertTimeFromSecondsToString":1}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2EwNS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcuanMiLCJqcy9jb3VudERvd25UaW1lck1vZHVsZS5qcyIsImpzL2NvdW50VXBUaW1lck1vZHVsZS5qcyIsImpzL2RlYWRsaW5lVGltZXJNb2R1bGUuanMiLCJqcy9kaXNwbGF5TWVzc2FnZU1vZHVsZS5qcyIsImpzL2lucHV0VmFsaWRhdGlvbkZ1bmMuanMiLCJqcy9tYWluLmpzIiwianMvbmV3U2Vjb25kRXZlbnRFbWl0dGVyLmpzIiwianMvc2NyZWVuMm5kTW9kdWxlLmpzIiwianMvc3dpdGNoVGltZXJPdXRwdXRGdW5jLmpzIiwianMvdGltZXJDb25zdHJ1Y3Rvci5qcyIsImpzL3ZhbGlkYXRlSW5wdXRGdW5jLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRpbWVJblNlY29uZHMpIHtcclxuICAgIHZhciBoID0gTWF0aC5mbG9vcih0aW1lSW5TZWNvbmRzIC8gKDM2MDApKTtcclxuICAgIHZhciBtID0gTWF0aC5mbG9vcigodGltZUluU2Vjb25kcyAtIGggKiAzNjAwKSAvIDYwKTtcclxuICAgIHZhciBzID0gTWF0aC5mbG9vcih0aW1lSW5TZWNvbmRzIC0gaCAqIDM2MDAgLSBtICogNjApO1xyXG4gICAgdmFyIHRpbWVTdHJpbmcgPSBcIlwiO1xyXG4gICAgaWYgKGggPiAwKSB7XHJcbiAgICAgICAgdGltZVN0cmluZyA9IGggKyBcIjpcIiArIChtIDwgMTAgPyBcIjBcIiArIG0gOiBtKSArIFwiOlwiICsgKHMgPCAxMCA/IFwiMFwiICsgcyA6IHMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aW1lU3RyaW5nID0gbSArIFwiOlwiICsgKHMgPCAxMCA/IFwiMFwiICsgcyA6IHMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRpbWVTdHJpbmc7XHJcbn1cclxuIiwiVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyQ29uc3RydWN0b3IuanMnKTtcclxuaW5wdXRWYWxpZGF0aW9uID0gcmVxdWlyZShcIi4vaW5wdXRWYWxpZGF0aW9uRnVuYy5qc1wiKTtcclxuc3dpdGNoVGltZXJPdXRwdXQgPSByZXF1aXJlKFwiLi9zd2l0Y2hUaW1lck91dHB1dEZ1bmMuanNcIik7XHJcbnZhciAkZGl2Q291bnREb3duID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdi5jb3VudF9kb3duXCIpO1xyXG5teVZhcnMuJGlucHV0QW5kRGlzcGxheVRpbWVDb3VudERvd24gPSAkZGl2Q291bnREb3duLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dCNjb3VudF9kb3duXCIpO1xyXG52YXIgJGJ1dHRvblN0YXJ0U3RvcENvdW50RG93biA9ICRkaXZDb3VudERvd24ucXVlcnlTZWxlY3RvcihcImJ1dHRvbi5zdGFydF9zdG9wXCIpO1xyXG52YXIgJGJ1dHRvblJlc2V0Q291bnREb3duID0gJGRpdkNvdW50RG93bi5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uLnJlc2V0XCIpO1xyXG5teVZhcnMuJGJ1dHRvblNob3dDb3VudERvd24gPSAkZGl2Q291bnREb3duLnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24uc2hvd1wiKTtcclxudmFyIGNvdW50RG93blRpbWVyID0gbmV3IFRpbWVyKCk7XHJcbm15VmFycy4kaW5wdXRBbmREaXNwbGF5VGltZUNvdW50RG93bi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBpbnB1dFZhbGlkYXRpb24obXlWYXJzLiRpbnB1dEFuZERpc3BsYXlUaW1lQ291bnREb3duLCBjb3VudERvd25UaW1lcik7XHJcbn0pXHJcbiRidXR0b25TdGFydFN0b3BDb3VudERvd24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN0YXJ0U3RvcENvdW50RG93bik7XHJcbiRidXR0b25SZXNldENvdW50RG93bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc2V0Q291bnREb3duKTtcclxubXlWYXJzLiRidXR0b25TaG93Q291bnREb3duLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3dpdGNoVGltZXJPdXRwdXQpO1xyXG5cclxuZnVuY3Rpb24gc3RhcnRTdG9wQ291bnREb3duKCkge1xyXG4gICAgaWYgKCRidXR0b25TdGFydFN0b3BDb3VudERvd24udGV4dENvbnRlbnQgPT09IFwi0J/Rg9GB0LpcIikge1xyXG4gICAgICAgICRidXR0b25TdGFydFN0b3BDb3VudERvd24udGV4dENvbnRlbnQgPSBcItCf0LDRg9C30LBcIjtcclxuICAgICAgICBteVZhcnMuJGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdXBkYXRlQ291bnREb3duVGltZXIpO1xyXG4gICAgfSBlbHNlIGlmICgkYnV0dG9uU3RhcnRTdG9wQ291bnREb3duLnRleHRDb250ZW50ID09PSBcItCf0LDRg9C30LBcIikge1xyXG4gICAgICAgICRidXR0b25TdGFydFN0b3BDb3VudERvd24udGV4dENvbnRlbnQgPSBcItCf0YPRgdC6XCI7XHJcbiAgICAgICAgbXlWYXJzLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHVwZGF0ZUNvdW50RG93blRpbWVyKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiB1cGRhdGVDb3VudERvd25UaW1lcigpIHtcclxuICAgIGNvdW50RG93blRpbWVyLmRlY3JlbWVudCgpO1xyXG4gICAgbXlWYXJzLiRpbnB1dEFuZERpc3BsYXlUaW1lQ291bnREb3duLnZhbHVlID0gY291bnREb3duVGltZXIudG9TdHJpbmcoKTtcclxuICAgIGlmIChjb3VudERvd25UaW1lci52YWx1ZSA9PT0gMCkge1xyXG4gICAgICAgICRidXR0b25TdGFydFN0b3BDb3VudERvd24udGV4dENvbnRlbnQgPSBcItCf0YPRgdC6XCI7XHJcbiAgICAgICAgbXlWYXJzLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHVwZGF0ZUNvdW50RG93blRpbWVyKTtcclxuICAgICAgICBteVZhcnMuJGlucHV0QW5kRGlzcGxheVRpbWVDb3VudERvd24uc3R5bGVbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdID0gXCJyZWRcIjtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiByZXNldENvdW50RG93bigpIHtcclxuICAgIGlmICgkYnV0dG9uU3RhcnRTdG9wQ291bnREb3duLnRleHRDb250ZW50ID09PSBcItCf0LDRg9C30LBcIikge1xyXG4gICAgICAgICRidXR0b25TdGFydFN0b3BDb3VudERvd24udGV4dENvbnRlbnQgPSBcItCf0YPRgdC6XCI7XHJcbiAgICAgICAgbXlWYXJzLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHVwZGF0ZUNvdW50RG93blRpbWVyKTtcclxuICAgIH1cclxuICAgIGNvdW50RG93blRpbWVyLnJlc2V0KCk7XHJcbiAgICBteVZhcnMuJGlucHV0QW5kRGlzcGxheVRpbWVDb3VudERvd24udmFsdWUgPSBcIlwiO1xyXG4gICAgbXlWYXJzLiRpbnB1dEFuZERpc3BsYXlUaW1lQ291bnREb3duLnN0eWxlW1wiYmFja2dyb3VuZC1jb2xvclwiXSA9IFwibGlnaHRibHVlXCI7XHJcbn1cclxuIiwiVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyQ29uc3RydWN0b3IuanMnKTtcclxuaW5wdXRWYWxpZGF0aW9uID0gcmVxdWlyZShcIi4vaW5wdXRWYWxpZGF0aW9uRnVuYy5qc1wiKTtcclxuc3dpdGNoVGltZXJPdXRwdXQgPSByZXF1aXJlKFwiLi9zd2l0Y2hUaW1lck91dHB1dEZ1bmMuanNcIik7XHJcbnZhciAkZGl2Q291bnRVcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYuY291bnRfdXBcIik7XHJcbm15VmFycy4kaW5wdXRBbmREaXNwbGF5VGltZUNvdW50VXAgPSAkZGl2Q291bnRVcC5xdWVyeVNlbGVjdG9yKFwiaW5wdXQjY291bnRfdXBcIik7XHJcbnZhciAkYnV0dG9uU3RhcnRTdG9wQ291bnRVcCA9ICRkaXZDb3VudFVwLnF1ZXJ5U2VsZWN0b3IoXCJidXR0b24uc3RhcnRfc3RvcFwiKTtcclxudmFyICRidXR0b25SZXNldENvdW50VXAgPSAkZGl2Q291bnRVcC5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uLnJlc2V0XCIpO1xyXG5teVZhcnMuJGJ1dHRvblNob3dDb3VudFVwID0gJGRpdkNvdW50VXAucXVlcnlTZWxlY3RvcihcImJ1dHRvbi5zaG93XCIpO1xyXG52YXIgY291bnRVcFRpbWVyID0gbmV3IFRpbWVyKCk7XHJcbm15VmFycy4kaW5wdXRBbmREaXNwbGF5VGltZUNvdW50VXAuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgaW5wdXRWYWxpZGF0aW9uKG15VmFycy4kaW5wdXRBbmREaXNwbGF5VGltZUNvdW50VXAsIGNvdW50VXBUaW1lcik7XHJcbn0pXHJcbiRidXR0b25TdGFydFN0b3BDb3VudFVwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdGFydFN0b3BDb3VudFVwKTtcclxuJGJ1dHRvblJlc2V0Q291bnRVcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc2V0Q291bnRVcCk7XHJcbm15VmFycy4kYnV0dG9uU2hvd0NvdW50VXAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzd2l0Y2hUaW1lck91dHB1dCk7XHJcblxyXG5mdW5jdGlvbiBzdGFydFN0b3BDb3VudFVwKCkge1xyXG4gICAgaWYgKCRidXR0b25TdGFydFN0b3BDb3VudFVwLnRleHRDb250ZW50ID09PSBcItCf0YPRgdC6XCIpIHtcclxuICAgICAgICAkYnV0dG9uU3RhcnRTdG9wQ291bnRVcC50ZXh0Q29udGVudCA9IFwi0J/QsNGD0LfQsFwiO1xyXG4gICAgICAgIG15VmFycy4kYm9keS5hZGRFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB1cGRhdGVDb3VudFVwVGltZXIpO1xyXG4gICAgfSBlbHNlIGlmICgkYnV0dG9uU3RhcnRTdG9wQ291bnRVcC50ZXh0Q29udGVudCA9PT0gXCLQn9Cw0YPQt9CwXCIpIHtcclxuICAgICAgICAkYnV0dG9uU3RhcnRTdG9wQ291bnRVcC50ZXh0Q29udGVudCA9IFwi0J/Rg9GB0LpcIjtcclxuICAgICAgICBteVZhcnMuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdXBkYXRlQ291bnRVcFRpbWVyKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiB1cGRhdGVDb3VudFVwVGltZXIoKSB7XHJcbiAgICBjb3VudFVwVGltZXIuaW5jcmVtZW50KCk7XHJcbiAgICBteVZhcnMuJGlucHV0QW5kRGlzcGxheVRpbWVDb3VudFVwLnZhbHVlID0gY291bnRVcFRpbWVyLnRvU3RyaW5nKCk7XHJcbn1cclxuZnVuY3Rpb24gcmVzZXRDb3VudFVwKCkge1xyXG4gICAgaWYgKCRidXR0b25TdGFydFN0b3BDb3VudFVwLnRleHRDb250ZW50ID09PSBcItCf0LDRg9C30LBcIikge1xyXG4gICAgICAgICRidXR0b25TdGFydFN0b3BDb3VudFVwLnRleHRDb250ZW50ID0gXCLQn9GD0YHQulwiO1xyXG4gICAgICAgIG15VmFycy4kYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCduZXdTZWNvbmQnLCB1cGRhdGVDb3VudFVwVGltZXIpO1xyXG4gICAgfVxyXG4gICAgY291bnRVcFRpbWVyLnJlc2V0KCk7XHJcbiAgICBteVZhcnMuJGlucHV0QW5kRGlzcGxheVRpbWVDb3VudFVwLnZhbHVlID0gXCJcIjtcclxufVxyXG4iLCJ2YWxpZGF0ZUlucHV0ID0gcmVxdWlyZShcIi4vdmFsaWRhdGVJbnB1dEZ1bmMuanNcIik7XHJcbmNvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZyA9IHJlcXVpcmUoXCIuL2NvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZy5qc1wiKTtcclxudmFyICRkaXZEZWFkbGluZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYuZGVhZGxpbmVcIik7XHJcbnZhciAkaW5wdXRBbmREaXNwbGF5VGltZURlYWRsaW5lID0gJGRpdkRlYWRsaW5lLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dCNkZWFkbGluZVwiKTtcclxubXlWYXJzLiRkaXNwbGF5VGltZUxlZnQgPSAkZGl2RGVhZGxpbmUucXVlcnlTZWxlY3RvcihcImlucHV0I2RlYWRsaW5lX3Nob3dcIik7XHJcbnZhciAkYnV0dG9uUmVzZXREZWFkbGluZSA9ICRkaXZEZWFkbGluZS5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uLnJlc2V0XCIpO1xyXG5teVZhcnMuJGJ1dHRvblNob3dEZWFkbGluZSA9ICRkaXZEZWFkbGluZS5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uLnNob3dcIik7XHJcbnZhciBEZWFkbGluZVRpbWVyID0ge1xyXG4gICAgdmFsdWU6IHVuZGVmaW5lZCxcclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgRGVhZGxpbmVUaW1lci52YWx1ZSA9IHVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICB0aW1lTGVmdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0aW1lciA9IE1hdGguZmxvb3IoKHRoaXMudmFsdWUgLSBuZXcgRGF0ZSgpKSAvIDEwMDApO1xyXG4gICAgICAgIGlmICh0aW1lciA8IDApIHJldHVybjtcclxuICAgICAgICB2YXIgaCA9IE1hdGguZmxvb3IodGltZXIgLyAzNjAwKTtcclxuICAgICAgICB2YXIgbSA9IE1hdGguZmxvb3IoKHRpbWVyIC0gaCAqIDM2MDApIC8gNjApO1xyXG4gICAgICAgIHZhciBzID0gTWF0aC5mbG9vcih0aW1lciAtIGggKiAzNjAwIC0gbSAqIDYwKTtcclxuICAgICAgICB2YXIgdGltZXJTdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgIGlmIChoID4gMCkge1xyXG4gICAgICAgICAgICB0aW1lclN0cmluZyA9IGggKyBcIjpcIiArIChtIDwgMTAgPyBcIjBcIiArIG0gOiBtKSArIFwiOlwiICsgKHMgPCAxMCA/IFwiMFwiICsgcyA6IHMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRpbWVyU3RyaW5nID0gbSArIFwiOlwiICsgKHMgPCAxMCA/IFwiMFwiICsgcyA6IHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGltZXJTdHJpbmc7XHJcbiAgICB9XHJcbn07XHJcbiRpbnB1dEFuZERpc3BsYXlUaW1lRGVhZGxpbmUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGRlYWRsaW5lVGltZUluU2Vjb25kcyA9IHZhbGlkYXRlSW5wdXQoJGlucHV0QW5kRGlzcGxheVRpbWVEZWFkbGluZSk7XHJcbiAgICBpZiAoZGVhZGxpbmVUaW1lSW5TZWNvbmRzLmlzVmFsaWQpIHtcclxuICAgICAgICB2YXIgZW50ZXJlZFRpbWUgPSBjb252ZXJ0VGltZUZyb21TZWNvbmRzVG9TdHJpbmcoZGVhZGxpbmVUaW1lSW5TZWNvbmRzLnZhbHVlKTtcclxuICAgICAgICBpZiAoZW50ZXJlZFRpbWUubGVuZ3RoID09PSA0KSB7XHJcbiAgICAgICAgICAgIGVudGVyZWRUaW1lID0gXCIwMDowXCIgKyBlbnRlcmVkVGltZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVudGVyZWRUaW1lLmxlbmd0aCA9PT0gNSkge1xyXG4gICAgICAgICAgICBlbnRlcmVkVGltZSA9IFwiMDA6XCIgKyBlbnRlcmVkVGltZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVudGVyZWRUaW1lLmxlbmd0aCA9PT0gNykge1xyXG4gICAgICAgICAgICBlbnRlcmVkVGltZSA9IFwiMFwiICsgZW50ZXJlZFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRpbnB1dEFuZERpc3BsYXlUaW1lRGVhZGxpbmUudmFsdWUgPSBlbnRlcmVkVGltZTtcclxuICAgICAgICB2YXIgZW5kVGltZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgZW5kVGltZS5zZXRIb3VycygrZW50ZXJlZFRpbWUuc3Vic3RyaW5nKDAsIDIpKTtcclxuICAgICAgICBlbmRUaW1lLnNldE1pbnV0ZXMoK2VudGVyZWRUaW1lLnN1YnN0cmluZygzLCA1KSk7XHJcbiAgICAgICAgZW5kVGltZS5zZXRTZWNvbmRzKCtlbnRlcmVkVGltZS5zdWJzdHJpbmcoNikpO1xyXG4gICAgICAgIGlmIChlbmRUaW1lIDwgbmV3IERhdGUoKSkge1xyXG4gICAgICAgICAgICBlbmRUaW1lLnNldERhdGUoZW5kVGltZS5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGVhZGxpbmVUaW1lci52YWx1ZSA9IGVuZFRpbWU7XHJcbiAgICAgICAgbXlWYXJzLiRib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHVwZGF0ZURlYWRsaW5lVGltZXIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXNldERlYWRsaW5lKCk7XHJcbiAgICB9XHJcblxyXG59KVxyXG4kYnV0dG9uUmVzZXREZWFkbGluZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc2V0RGVhZGxpbmUpO1xyXG5teVZhcnMuJGJ1dHRvblNob3dEZWFkbGluZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN3aXRjaFRpbWVyT3V0cHV0KTtcclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZURlYWRsaW5lVGltZXIoKSB7XHJcbiAgICBteVZhcnMuJGRpc3BsYXlUaW1lTGVmdC52YWx1ZSA9IERlYWRsaW5lVGltZXIudGltZUxlZnQoKTtcclxuICAgIGlmIChteVZhcnMuJGRpc3BsYXlUaW1lTGVmdC52YWx1ZSA9PT0gXCIwOjAwXCIpIHtcclxuICAgICAgICBteVZhcnMuJGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbmV3U2Vjb25kJywgdXBkYXRlRGVhZGxpbmVUaW1lcik7XHJcbiAgICAgICAgJGlucHV0QW5kRGlzcGxheVRpbWVEZWFkbGluZS5zdHlsZVtcImJhY2tncm91bmQtY29sb3JcIl0gPSBcInJlZFwiO1xyXG4gICAgICAgIG15VmFycy4kZGlzcGxheVRpbWVMZWZ0LnN0eWxlLmNvbG9yID0gXCJyZWRcIjtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiByZXNldERlYWRsaW5lKCkge1xyXG4gICAgbXlWYXJzLiRib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ25ld1NlY29uZCcsIHVwZGF0ZURlYWRsaW5lVGltZXIpO1xyXG4gICAgRGVhZGxpbmVUaW1lci5yZXNldCgpO1xyXG4gICAgJGlucHV0QW5kRGlzcGxheVRpbWVEZWFkbGluZS52YWx1ZSA9IFwiXCI7XHJcbiAgICAkaW5wdXRBbmREaXNwbGF5VGltZURlYWRsaW5lLnN0eWxlW1wiYmFja2dyb3VuZC1jb2xvclwiXSA9IFwibGlnaHRibHVlXCI7XHJcbiAgICBteVZhcnMuJGRpc3BsYXlUaW1lTGVmdC52YWx1ZSA9IFwiXCI7XHJcbiAgICBteVZhcnMuJGRpc3BsYXlUaW1lTGVmdC5zdHlsZS5jb2xvciA9IFwiYmxhY2tcIjtcclxufVxyXG4iLCJteVZhcnMuJGRpc3BsYXlNZXNzYWdlU3RyaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiNtZXNzYWdlX3Nob3dcIik7XHJcbnZhciAkaW5wdXRNZXNzYWdlU3RyaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInRleHRhcmVhI21lc3NhZ2VcIik7XHJcbiRpbnB1dE1lc3NhZ2VTdHJpbmcuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBwcm9jZXNzTWVzc2FnZSk7XHJcbiRpbnB1dE1lc3NhZ2VTdHJpbmcuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgcHJvY2Vzc0tleURvd24pO1xyXG5mdW5jdGlvbiBwcm9jZXNzTWVzc2FnZSgpIHtcclxuICAgIGlmIChteVZhcnMuJHNjcmVlbjJNZXNzYWdlKSB7XHJcbiAgICAgICAgbXlWYXJzLiRkaXNwbGF5TWVzc2FnZVN0cmluZy50ZXh0Q29udGVudCA9ICRpbnB1dE1lc3NhZ2VTdHJpbmcudmFsdWU7XHJcbiAgICAgICAgbXlWYXJzLiRzY3JlZW4yTWVzc2FnZS50ZXh0Q29udGVudCA9ICRpbnB1dE1lc3NhZ2VTdHJpbmcudmFsdWU7XHJcbiAgICB9IGVsc2UgbXlWYXJzLiRkaXNwbGF5TWVzc2FnZVN0cmluZy50ZXh0Q29udGVudCA9IFwi0J3QtdGCINC+0LrQvdCwINGB0YPRhNC70LXRgNCwXCI7XHJcbn1cclxuZnVuY3Rpb24gcHJvY2Vzc0tleURvd24oZXZlbnQpIHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgIHByb2Nlc3NNZXNzYWdlKCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcclxuICAgICAgICBteVZhcnMuJGRpc3BsYXlNZXNzYWdlU3RyaW5nLnRleHRDb250ZW50ID0gJGlucHV0TWVzc2FnZVN0cmluZy52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgcHJvY2Vzc01lc3NhZ2UoKTtcclxuICAgIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3NNZXNzYWdlO1xyXG4iLCJ2YWxpZGF0ZUlucHV0ID0gcmVxdWlyZShcIi4vdmFsaWRhdGVJbnB1dEZ1bmMuanNcIilcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJGlucHV0LCB0aW1lcikge1xyXG4gICAgICAgIHZhciBpbnB1dCA9IHZhbGlkYXRlSW5wdXQoJGlucHV0KTtcclxuICAgICAgICBpZiAoaW5wdXQuaXNWYWxpZCkge1xyXG4gICAgICAgICAgICB0aW1lci5zZXQoaW5wdXQudmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHdpbmRvdy5teVZhcnMgPSB7XHJcbiAgICAgICAgJGJvZHk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLFxyXG4gICAgfVxyXG4gICAgcmVxdWlyZShcIi4vY291bnRVcFRpbWVyTW9kdWxlLmpzXCIpO1xyXG4gICAgcmVxdWlyZShcIi4vY291bnREb3duVGltZXJNb2R1bGUuanNcIik7XHJcbiAgICByZXF1aXJlKFwiLi9kZWFkbGluZVRpbWVyTW9kdWxlLmpzXCIpO1xyXG4gICAgcmVxdWlyZShcIi4vc2NyZWVuMm5kTW9kdWxlLmpzXCIpO1xyXG4gICAgcmVxdWlyZShcIi4vZGlzcGxheU1lc3NhZ2VNb2R1bGUuanNcIik7XHJcbiAgICByZXF1aXJlKCcuL25ld1NlY29uZEV2ZW50RW1pdHRlci5qcycpO1xyXG59IiwidmFyIGN1cnJlbnRUaW1lSW5TZWNvbmRzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XHJcbnZhciBuZXdTZWNvbmRJbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZW1pdHRFdmVudEV2ZXJ5U2Vjb25kLCAxMDApO1xyXG5mdW5jdGlvbiBlbWl0dEV2ZW50RXZlcnlTZWNvbmQoKSB7XHJcbiAgICB2YXIgbmV3VGltZUluU2Vjb25kcyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xyXG4gICAgaWYgKGN1cnJlbnRUaW1lSW5TZWNvbmRzICE9PSBuZXdUaW1lSW5TZWNvbmRzKSB7XHJcbiAgICAgICAgY3VycmVudFRpbWVJblNlY29uZHMgPSBuZXdUaW1lSW5TZWNvbmRzO1xyXG4gICAgICAgIHZhciBteUV2ZW50ID0gbmV3IEV2ZW50KCduZXdTZWNvbmQnKTtcclxuICAgICAgICBteVZhcnMuJGJvZHkuZGlzcGF0Y2hFdmVudChteUV2ZW50KTtcclxuICAgIH1cclxufVxyXG5cclxuIiwicHJvY2Vzc01lc3NhZ2UgPSByZXF1aXJlKFwiLi9kaXNwbGF5TWVzc2FnZU1vZHVsZS5qc1wiKTtcclxubXlWYXJzLnNjcmVlbjIgPSBudWxsO1xyXG5teVZhcnMuJHNjcmVlbjJUaW1lciA9IG51bGw7XHJcbm15VmFycy4kc2NyZWVuMk1lc3NhZ2UgPSBudWxsO1xyXG4kc2NyZWVuMk9wZW5DbG9zZUJ1dHRvbiA9IG15VmFycy4kYm9keS5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI3NjcmVlbjJcIik7XHJcbiRzY3JlZW4yT3BlbkNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3BlbkNsb3NlU2NyZWVuMik7XHJcbmZ1bmN0aW9uIG9wZW5DbG9zZVNjcmVlbjIoKSB7XHJcbiAgICBpZiAobXlWYXJzLnNjcmVlbjIpIHNjcmVlbjJXaW5kb3dDbG9zZSgpO1xyXG4gICAgZWxzZSBzY3JlZW4yV2luZG93Q3JlYXRlKCk7XHJcbn1cclxuZnVuY3Rpb24gc2NyZWVuMldpbmRvd0NyZWF0ZSgpIHtcclxuICAgIHZhciBzdHJXaW5kb3dGZWF0dXJlcyA9IFwibWVudWJhcj1ubywgbG9jYXRpb249bm8sIGxvY2F0aW9uYmFyPW5vLCB0b29sYmFyPW5vLCBwZXJzb25hbGJhcj1ubywgc3RhdHVzPW5vLCByZXNpemFibGU9eWVzLCBzY3JvbGxiYXJzPW5vLHN0YXR1cz1ub1wiO1xyXG4gICAgdmFyIHN0cldpbmRvd1Bvc2l0aW9uQW5kU2l6ZSA9IFwiaGVpZ2h0PTUwMCx3aWR0aD00MDBcIjtcclxuICAgIG15VmFycy5zY3JlZW4yID0gd2luZG93Lm9wZW4oXCJzY3JlZW4yLmh0bWxcIiwgXCJzY3JlZW4ybmRcIiwgc3RyV2luZG93UG9zaXRpb25BbmRTaXplICsgXCIsXCIgKyBzdHJXaW5kb3dGZWF0dXJlcyk7XHJcbiAgICBteVZhcnMuc2NyZWVuMi5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIG15VmFycy4kc2NyZWVuMlRpbWVyID0gbXlWYXJzLnNjcmVlbjIuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aW1lX2xlZnRcIik7XHJcbiAgICAgICAgbXlWYXJzLiRzY3JlZW4yTWVzc2FnZSA9IG15VmFycy5zY3JlZW4yLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXYjbWVzc2FnZV9zaG93XCIpO1xyXG4gICAgICAgICRzY3JlZW4yT3BlbkNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gXCLQl9Cw0LrRgNGL0YLRjCDQvtC60L3QviDRgdGD0YTQu9C10YDQsFwiO1xyXG4gICAgICAgIHByb2Nlc3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbXlWYXJzLnNjcmVlbjIuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzY3JlZW4yV2luZG93Q2xvc2UoKTtcclxuICAgICAgICAgICAgc3dpdGNoVGltZXJPdXRwdXQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgc2NyZWVuMldpbmRvd0Nsb3NlRnVuYyk7XHJcbn1cclxuZnVuY3Rpb24gc2NyZWVuMldpbmRvd0Nsb3NlRnVuYygpIHtcclxuICAgIGlmIChteVZhcnMuc2NyZWVuMikgc2NyZWVuMldpbmRvd0Nsb3NlKCk7XHJcbn1cclxuZnVuY3Rpb24gc2NyZWVuMldpbmRvd0Nsb3NlKCkge1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VubG9hZCcsIHNjcmVlbjJXaW5kb3dDbG9zZUZ1bmMpO1xyXG4gICAgbXlWYXJzLiRzY3JlZW4yVGltZXIgPSBudWxsO1xyXG4gICAgbXlWYXJzLiRzY3JlZW4yTWVzc2FnZSA9IG51bGw7XHJcbiAgICBwcm9jZXNzTWVzc2FnZSgpO1xyXG4gICAgbXlWYXJzLnNjcmVlbjIuY2xvc2UoKTtcclxuICAgIG15VmFycy5zY3JlZW4yID0gbnVsbDtcclxuICAgICRzY3JlZW4yT3BlbkNsb3NlQnV0dG9uLnRleHRDb250ZW50ID0gXCLQodC+0LfQtNCw0YLRjCDQvtC60L3QviDRgdGD0YTQu9C10YDQsFwiO1xyXG59XHJcbiIsInZhciAkZGlzcGxheU91dHB1dFRpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdiN0aW1lX2xlZnRcIik7XHJcbnZhciBjdXJyZW50U291cmNlRm9yT3V0cHV0ID0gbnVsbDtcclxudmFyIHNob3dUaW1lckludGVydmFsSUQ7XHJcbmZ1bmN0aW9uIHN3aXRjaFRpbWVyT3V0cHV0KGV2ZW50KSB7XHJcbiAgICBjbGVhckludGVydmFsKHNob3dUaW1lckludGVydmFsSUQpO1xyXG4gICAgbXlWYXJzLiRidXR0b25TaG93Q291bnRVcC5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gbXlWYXJzLiRidXR0b25TaG93Q291bnREb3duLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSBteVZhcnMuJGJ1dHRvblNob3dEZWFkbGluZS5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gJ2J1dHRvbmZhY2UnO1xyXG4gICAgaWYgKCFteVZhcnMuc2NyZWVuMiB8fCAhbXlWYXJzLiRzY3JlZW4yVGltZXIpIHtcclxuICAgICAgICBjdXJyZW50U291cmNlRm9yT3V0cHV0ID0gbnVsbDtcclxuICAgICAgICAkZGlzcGxheU91dHB1dFRpbWVyLnRleHRDb250ZW50ID0gXCJcIjtcclxuICAgICAgICBteVZhcnMuJGRpc3BsYXlNZXNzYWdlU3RyaW5nLnRleHRDb250ZW50ID0gXCLQndC10YIg0L7QutC90LAg0YHRg9GE0LvQtdGA0LBcIjtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHN3aXRjaCAoZXZlbnQudGFyZ2V0IHx8IGV2ZW50LnNyY0VsZW1lbnQpIHtcclxuICAgICAgICBjYXNlIG15VmFycy4kYnV0dG9uU2hvd0NvdW50VXA6XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U291cmNlRm9yT3V0cHV0ID09PSBteVZhcnMuJGlucHV0QW5kRGlzcGxheVRpbWVDb3VudFVwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlRm9yT3V0cHV0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICRkaXNwbGF5T3V0cHV0VGltZXIudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaWYgKG15VmFycy4kc2NyZWVuMlRpbWVyKSBteVZhcnMuJHNjcmVlbjJUaW1lci50ZXh0Q29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlRm9yT3V0cHV0ID0gbXlWYXJzLiRpbnB1dEFuZERpc3BsYXlUaW1lQ291bnRVcDtcclxuICAgICAgICAgICAgICAgIHNob3dUaW1lcigpO1xyXG4gICAgICAgICAgICAgICAgbXlWYXJzLiRidXR0b25TaG93Q291bnRVcC5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gJ2xhd25ncmVlbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIG15VmFycy4kYnV0dG9uU2hvd0NvdW50RG93bjpcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTb3VyY2VGb3JPdXRwdXQgPT09IG15VmFycy4kaW5wdXRBbmREaXNwbGF5VGltZUNvdW50RG93bikge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZUZvck91dHB1dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkZGlzcGxheU91dHB1dFRpbWVyLnRleHRDb250ZW50ID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmIChteVZhcnMuJHNjcmVlbjJUaW1lcikgbXlWYXJzLiRzY3JlZW4yVGltZXIudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZUZvck91dHB1dCA9IG15VmFycy4kaW5wdXRBbmREaXNwbGF5VGltZUNvdW50RG93bjtcclxuICAgICAgICAgICAgICAgIHNob3dUaW1lcigpO1xyXG4gICAgICAgICAgICAgICAgbXlWYXJzLiRidXR0b25TaG93Q291bnREb3duLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSAnbGF3bmdyZWVuJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgbXlWYXJzLiRidXR0b25TaG93RGVhZGxpbmU6XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U291cmNlRm9yT3V0cHV0ID09PSBteVZhcnMuJGRpc3BsYXlUaW1lTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZUZvck91dHB1dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAkZGlzcGxheU91dHB1dFRpbWVyLnRleHRDb250ZW50ID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmIChteVZhcnMuJHNjcmVlbjJUaW1lcikgbXlWYXJzLiRzY3JlZW4yVGltZXIudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZUZvck91dHB1dCA9IG15VmFycy4kZGlzcGxheVRpbWVMZWZ0O1xyXG4gICAgICAgICAgICAgICAgc2hvd1RpbWVyKCk7XHJcbiAgICAgICAgICAgICAgICBteVZhcnMuJGJ1dHRvblNob3dEZWFkbGluZS5zdHlsZVsnYmFja2dyb3VuZC1jb2xvciddID0gJ2xhd25ncmVlbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIG15VmFycy5zY3JlZW4yOlxyXG4gICAgICAgICAgICBjdXJyZW50U291cmNlRm9yT3V0cHV0ID0gbnVsbDtcclxuICAgICAgICAgICAgJGRpc3BsYXlPdXRwdXRUaW1lci50ZXh0Q29udGVudCA9IFwiXCI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzaG93VGltZXIoKSB7XHJcbiAgICAgICAgc2hvd1RpbWVySW50ZXJ2YWxJRCA9IHNldEludGVydmFsKHNob3csIDEwMCk7XHJcbiAgICAgICAgZnVuY3Rpb24gc2hvdygpIHtcclxuICAgICAgICAgICAgaWYgKCFteVZhcnMuJHNjcmVlbjJUaW1lcikge1xyXG4gICAgICAgICAgICAgICAgJGRpc3BsYXlPdXRwdXRUaW1lci50ZXh0Q29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbWluRm9udFNpemUgPSAyMztcclxuICAgICAgICAgICAgdmFyIG1heEZvbnRTaXplID0gNDA7XHJcbiAgICAgICAgICAgIHZhciBtaW5TdHJpbmdMZW5ndGggPSA0O1xyXG4gICAgICAgICAgICB2YXIgbWF4U3RyaW5nTGVuZ3RoID0gODtcclxuICAgICAgICAgICAgdmFyIGZvbnRTaXplID0gTWF0aC5mbG9vcihtaW5Gb250U2l6ZSArIChtYXhTdHJpbmdMZW5ndGggLSBjdXJyZW50U291cmNlRm9yT3V0cHV0LnZhbHVlLmxlbmd0aCkgKiAobWF4Rm9udFNpemUgLSBtaW5Gb250U2l6ZSkgLyAobWF4U3RyaW5nTGVuZ3RoIC0gbWluU3RyaW5nTGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIG15VmFycy4kc2NyZWVuMlRpbWVyLnN0eWxlWydmb250LXNpemUnXSA9IGZvbnRTaXplICsgJ3Z3JztcclxuICAgICAgICAgICAgJGRpc3BsYXlPdXRwdXRUaW1lci50ZXh0Q29udGVudCA9IG15VmFycy4kc2NyZWVuMlRpbWVyLnRleHRDb250ZW50ID0gY3VycmVudFNvdXJjZUZvck91dHB1dC52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBzd2l0Y2hUaW1lck91dHB1dDtcclxuIiwiXHR2YXIgVGltZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuICAgIFRpbWVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBpZighaXNOYU4odmFsdWUpKSB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBUaW1lci5wcm90b3R5cGUuaW5jcmVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWUrKztcclxuICAgIH1cclxuICAgIFRpbWVyLnByb3RvdHlwZS5kZWNyZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPiAwKSB0aGlzLnZhbHVlLS07XHJcbiAgICB9XHJcbiAgICBUaW1lci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgICBUaW1lci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoXCIuL2NvbnZlcnRUaW1lRnJvbVNlY29uZHNUb1N0cmluZy5qc1wiKSh0aGlzLnZhbHVlKTtcclxuICAgIH1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGltZXI7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJGlucHV0KSB7XHJcbiAgICB2YXIgdGltZVN0cmluZyA9ICgkaW5wdXQudmFsdWUgPyAkaW5wdXQudmFsdWUgOiAwKTtcclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgdmFsdWU6IE5hTixcclxuICAgICAgICBpc1ZhbGlkOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKHRpbWVTdHJpbmcpKSB7XHJcbiAgICAgICAgdmFyIHZhbGlkQ2hhcnMgPSBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgXCI6XCJdO1xyXG4gICAgICAgIHZhciB0aW1lTnVtYmVyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbWVTdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGFyZVZhbGlkID0gdmFsaWRDaGFycy5zb21lKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZVN0cmluZ1tpXSA9PSBpdGVtO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpZiAoIWFyZVZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcItCU0L7Qv9GD0YHRgtC40LzQviDQstCy0L7QtNC40YLRjCDRgtC+0LvRjNC60L4g0YbQuNGE0YDRiyDQuCDQtNCy0L7QtdGC0L7Rh9C40Y8uXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aW1lU3RyaW5nW2ldICE9PSBcIjpcIikgdGltZU51bWJlciA9IHRpbWVOdW1iZXIgKiAxMCArICgrdGltZVN0cmluZ1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHRpbWVOdW1iZXIgPSB0aW1lU3RyaW5nO1xyXG5cclxuICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IodGltZU51bWJlciAvIDEwMDAwKTtcclxuICAgIGlmIChob3VycyA+IDIzKSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfRh9Cw0YHQvtCyJyDQsdC+0LvRjNGI0LUgMjMuXCIpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigodGltZU51bWJlciAtIGhvdXJzICogMTAwMDApIC8gMTAwKTtcclxuICAgIGlmIChtaW51dGVzID4gNTkpIHtcclxuICAgICAgICBhbGVydChcItCX0L3QsNGH0LXQvdC40LUgJ9C80LjQvdGD0YInINCx0L7Qu9GM0YjQtSA1OS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKHRpbWVOdW1iZXIgLSBob3VycyAqIDEwMDAwIC0gbWludXRlcyAqIDEwMCk7XHJcbiAgICBpZiAoc2Vjb25kcyA+IDU5KSB7XHJcbiAgICAgICAgYWxlcnQoXCLQl9C90LDRh9C10L3QuNC1ICfRgdC10LrRg9C90LQnINCx0L7Qu9GM0YjQtSA1OS5cIik7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG4gICAgdmFyIHRpbWVJblNlY29uZHMgPSBob3VycyAqIDM2MDAgKyBtaW51dGVzICogNjAgKyBzZWNvbmRzO1xyXG4gICAgJGlucHV0LnZhbHVlID0gcmVxdWlyZShcIi4vY29udmVydFRpbWVGcm9tU2Vjb25kc1RvU3RyaW5nXCIpKHRpbWVJblNlY29uZHMpO1xyXG4gICAgcmV0dXJuIHJlc3VsdCA9IHtcclxuICAgICAgICB2YWx1ZTogdGltZUluU2Vjb25kcyxcclxuICAgICAgICBpc1ZhbGlkOiB0cnVlXHJcbiAgICB9XHJcbn1cclxuIl19
