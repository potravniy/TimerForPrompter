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
