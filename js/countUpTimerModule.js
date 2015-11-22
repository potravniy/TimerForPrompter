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
