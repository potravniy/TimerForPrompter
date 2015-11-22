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
