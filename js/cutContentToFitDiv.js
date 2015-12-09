module.exports = function ($messageOnPrompter, $messageOnMain) {
	var temp = $messageOnPrompter.textContent;
	$messageOnPrompter.textContent = "";
	var scrollHeight = $messageOnPrompter.scrollHeight,
		toggle = true;
	var id = setInterval(cutContentToFitDiv, 4);
	function cutContentToFitDiv() {
		if(toggle){
			$messageOnPrompter.textContent = temp;
			toggle = false;
		} else {
			if($messageOnPrompter.scrollHeight > scrollHeight){
				temp = $messageOnPrompter.textContent.slice(0, -1);
				toggle = true;
			} else {
				clearInterval(id);
				$messageOnMain.textContent = temp;
			}
		}
	}
}