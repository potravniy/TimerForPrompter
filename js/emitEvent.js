module.exports = function (eventName, customEventInit) {
    var evnt = new CustomEvent(eventName, customEventInit);
    Prompter.$body.dispatchEvent(evnt);
}