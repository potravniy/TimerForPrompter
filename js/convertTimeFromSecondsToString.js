module.exports = function (timeInSeconds) {
    var h = Math.floor(timeInSeconds / (3600));
    var m = Math.floor((timeInSeconds - h * 3600) / 60);
    var s = Math.floor(timeInSeconds - h * 3600 - m * 60);
    var timeString = "";
    if (h > 0) {
        timeString = h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    } else {
        timeString = m + ":" + (s < 10 ? "0" + s : s);
    }
    return timeString;
}
