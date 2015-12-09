var cutContentToFit = require("./cutContentToFitDiv.js");
var emit = require("./emitEvent");

var Messenger = function() {
	var $inputMessage = document.querySelector("textarea#message");
	var $messageOnMain = document.querySelector("div#message_show");           
	var $messageOnPrompter = null;
	var that = this;
	this.emit = emit;	
	this._processMessage = function () {
	    if (window.Tmr.state._prompterSt === "prompter-on") {
			if (!$messageOnPrompter) {
				$messageOnPrompter = window.Tmr.prompterWindow
					.document.querySelector("div#message_show"); 
			}
	        that._showMessage();
	    } else {
			$messageOnPrompter = null;
	    	that.emit("openPrompterWindow");
	    }
	}
	this._showMessage = function () {
		$messageOnPrompter.textContent = $messageOnMain.textContent
			= $inputMessage.value;
		$inputMessage.value = "";
		cutContentToFit($messageOnPrompter, $messageOnMain);
	}
	this._processKeyDown = function (event) {
	    if (event.keyCode === 13) {
	        that._processMessage();
	        event.preventDefault();
	    } else if (event.keyCode === 27) {
			$inputMessage.value = "";
	    }
	}
	this._windowCreated = function(){
		$messageOnPrompter = window.Tmr.prompterWindow
			.document.querySelector("div#message_show");
		if($inputMessage.value) that._showMessage();
	}
	this._windowClosed = function(){
		$messageOnPrompter = null;
		$messageOnMain.textContent = "";
	}
	$inputMessage.addEventListener("keydown", that._processKeyDown);
	window.Tmr.$body.addEventListener('prompterWindowCreated'
		, that._windowCreated);
	window.Tmr.$body.addEventListener('prompterWindowClosed'
		, that._windowClosed);
}
module.exports = Messenger;