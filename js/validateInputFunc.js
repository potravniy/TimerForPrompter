module.exports = function ($input) {
    var timeString = ($input.value ? $input.value : 0);
    var result = {
        value: NaN,
        isValid: false
    }
    if (isNaN(timeString)) {
        var validChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ":"];
        var timeNumber = 0;
        for (var i = 0; i < timeString.length; i++) {
            var areValid = validChars.some(function (item) {
                return timeString[i] == item;
            })
            if (!areValid) {
                alert("Допустимо вводить только цифры и двоеточия.");
                return result
            }
            if (timeString[i] !== ":") timeNumber = timeNumber * 10 + (+timeString[i]);
        }
    } else timeNumber = timeString;

    var hours = Math.floor(timeNumber / 10000);
    if (hours > 23) {
        alert("Значение 'часов' больше 23.");
        return result
    }
    var minutes = Math.floor((timeNumber - hours * 10000) / 100);
    if (minutes > 59) {
        alert("Значение 'минут' больше 59.");
        return result
    }
    var seconds = Math.floor(timeNumber - hours * 10000 - minutes * 100);
    if (seconds > 59) {
        alert("Значение 'секунд' больше 59.");
        return result
    }
    var timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    $input.value = require("./convertTimeFromSecondsToString")(timeInSeconds);
    return result = {
        value: timeInSeconds,
        isValid: true
    }
}
