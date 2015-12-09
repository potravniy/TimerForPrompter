module.exports = function (eventName, customEventInit) {
    var evnt = new CustomEvent(eventName, customEventInit);
    window.Tmr.$body.dispatchEvent(evnt);
}