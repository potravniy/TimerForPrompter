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
