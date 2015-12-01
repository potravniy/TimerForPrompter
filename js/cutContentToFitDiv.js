module.exports = function () {
	var temp = window.Prompter.View.$messageDivSecondDispl.textContent;
	window.Prompter.View.$messageDivSecondDispl.textContent = "";
	var scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if (!scrollHeight) scrollHeight = window.Prompter.View.$messageDivSecondDispl.scrollHeight;
		if(toggle){
			window.Prompter.View.$messageDivSecondDispl.textContent = temp;
			toggle = false;
		} else {
			if(window.Prompter.View.$messageDivSecondDispl.scrollHeight > scrollHeight){
				temp = window.Prompter.View.$messageDivSecondDispl.textContent.slice(0, -1);
				toggle = true;
			} else {
				clearInterval(id);
				window.Prompter.$showMessage.textContent = temp;
			}
		}
	}
}