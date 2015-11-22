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
