	var Timer = function () {
        this.value = 0;
        return this
    }
    Timer.prototype.set = function (value) {
        if(!isNaN(value)) this.value = value;
    }
    Timer.prototype.increment = function () {
        this.value++;
    }
    Timer.prototype.decrement = function () {
        if (this.value > 0) this.value--;
    }
    Timer.prototype.reset = function () {
        this.value = 0;
    }
    Timer.prototype.toString = function () {
        return require("./convertTimeFromSecondsToString.js")(this.value);
    }

module.exports = Timer;