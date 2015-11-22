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

