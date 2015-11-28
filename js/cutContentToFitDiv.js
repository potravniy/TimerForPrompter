module.exports = function ($messageDivSecondDispl) {
	var temp = $messageDivSecondDispl.textContent;
	$messageDivSecondDispl.textContent = "";
	var scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if (!scrollHeight) scrollHeight = $messageDivSecondDispl.scrollHeight;
		if(toggle){
			$messageDivSecondDispl.textContent = temp;
			toggle = false;
		} else {
			if($messageDivSecondDispl.scrollHeight > scrollHeight){
				temp = $messageDivSecondDispl.textContent.slice(0, -1);
				toggle = true;
			} else {
				clearInterval(id);
				Prompter.$showMessage.textContent = temp;
			}
		}
	}
}