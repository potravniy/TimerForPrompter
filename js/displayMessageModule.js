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
