validateInput = require("./validateInputFunc.js")
module.exports = function ($input, timer) {
        var input = validateInput($input);
        if (input.isValid) {
            timer.set(input.value);
        }
    }
