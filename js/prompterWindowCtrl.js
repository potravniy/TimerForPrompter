var WinControl = function(){
	this.emit = require("./emitEvent");
	this._$buttonOnOff = document.querySelector("button#screen2");
	var that = this;
	this._openWindow = function() {
	    var strWindowFeatures = "menubar=no, location=no, locationbar=no";
		strWindowFeatures += "toolbar=no, personalbar=no, status=no";
		strWindowFeatures += "resizable=yes, scrollbars=no,status=no";
	    var strWindowPositionAndSize = "height=300,width=500";
//		var loc = "http://potravniy.github.io/";
//	    window.Tmr.prompterWindow = window.open(loc + "prompter.html", "prompter"
	    window.Tmr.prompterWindow = window.open("prompter.html","prompter"
			, strWindowPositionAndSize + "," + strWindowFeatures);
	    if(!window.Tmr.prompterWindow) return;
	    window.Tmr.prompterWindow.addEventListener('load', start);
		function start() {
//	        var w = window.Tmr.prompterWindow;
			that.emit("prompterWindowCreated");
	        window.Tmr.state.prompterSet("prompter-on");
		    window.addEventListener('unload', that._closeIfWindowIs);
	        window.Tmr.prompterWindow.addEventListener('unload'
				, that._closeWindow);
//			var i = that.a();
//			if(i.l!==26 || i.r!==2555){setTimeout(w.close(), Math.floor(1500 + Math.random(3000)))}
		    window.Tmr.prompterWindow.removeEventListener('load', start);
	    }
	}
	this._closeWindow = function() {
	    window.removeEventListener('unload', that._closeIfWindowIs);
	    window.Tmr.prompterWindow.removeEventListener('unload'
			, that._closeWindow);
	    window.Tmr.prompterWindow.close();
		window.Tmr.prompterWindow = null;
	    window.Tmr.state.prompterSet("prompter-off");
		that.emit("prompterWindowClosed");
	}
	this._toggleWindow = function () {
	    if (window.Tmr.state._prompterSt === "prompter-on"){
			that._closeWindow();
		} else that._openWindow();
	}
	this._closeIfWindowIs = function () {
	    if (window.Tmr.state._prompterSt === "prompter-on") {
			that._closeWindow();
		}
	}
	this._$buttonOnOff.addEventListener('click', that._toggleWindow);
	window.Tmr.$body.addEventListener('openPrompterWindow'
		, that._openWindow);
	// this.a = function(){
	// 	var o = location.origin;
	// 	var r = 0;
	// 	for(var i=0; i<o.length; i++) {
	// 		r += o.charCodeAt(i);
	// 	}
	// 	return {
	// 		r: r,
	// 		l: o.length
	// 	}
	// }
}
module.exports = WinControl;