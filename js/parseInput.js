module.exports = function (timeString) {
    var $inputTime = document.querySelector("input#time");
    if (!timeString) {
        timeString = ($inputTime.value
            ? $inputTime.value : 0);
    }
    var result = {
        value: NaN,
        isValid: false
    }
    if (isNaN(timeString)) {
        var validChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ":"];
        var timeNumber = 0;
        for (var i = 0; i < timeString.length; i++) {
            var isCharValid = validChars.some(function (item) {
                return timeString[i] == item;
            })
            if (!isCharValid) {
                $inputTime.value("ЧЧ:ММ:СС'");
                return result
            }
            if (timeString[i] !== ":") {
                timeNumber = timeNumber * 10 + (+timeString[i]);
            }
        }
    } else timeNumber = timeString;

    var hours = Math.floor(timeNumber / 10000);
    if (hours > 23) {
        $inputTime.value("ЧЧ > 23");
        return result
    }
    var minutes = Math.floor((timeNumber - hours * 10000) / 100);
    if (minutes > 59) {
        $inputTime.value("ММ > 59");
        return result
    }
    var seconds = Math.floor(timeNumber - hours * 10000 - minutes * 100);
    if (seconds > 59) {
        $inputTime.value("СС > 59");
        return result
    }
    var timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return result = {
        value: timeInSeconds,
        isValid: true
    }
}
