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