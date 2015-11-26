module.exports = function(that) {
    var strWindowFeatures = "menubar=no, location=no, locationbar=no, toolbar=no, personalbar=no, status=no, resizable=yes, scrollbars=no,status=no";
    var strWindowPositionAndSize = "height=300,width=300";
    that._prompterWindow = window.open("prompter.html", "prompter", strWindowPositionAndSize + "," + strWindowFeatures);
    if(!that._prompterWindow) return;

    that._prompterWindow.addEventListener('load', function () {

        that._$timeOnPrompter = that._prompterWindow.document.querySelector("div#time_left");
        that._$messageOnPrompter = that._prompterWindow.document.querySelector("div#message_show");
        that._$prompterWindowButtonOnOff.innerHTML = "Закрыть<br>второе<br>окно";
        that._showMessage();

	    window.addEventListener('unload', that._prompterWindowCloseFunc);
        that._prompterWindow.addEventListener('unload', that._closePrompterWindow);

        var mainScreenWidth = window.screen.width;
        var count = 0;
        var isWindowFit = false;
        var xOld = that._prompterWindow.screenLeft;
        var yOld = that._prompterWindow.screenTop;
        var intervalID = setInterval(autoFitWindow, 150);
        function autoFitWindow() {
			if    (that._prompterWindow.document.fullscreenElement 
				|| that._prompterWindow.document.webkitFullscreenElement 
				|| that._prompterWindow.document.mozFullScreenElement 
				|| that._prompterWindow.document.msFullscreenElement) {
	        	that._prompterWindow.removeEventListener('drop', autoFitWindow);
	        	clearInterval(intervalID);
		    }
   	        var xNew = that._prompterWindow.screenLeft;
	        var yNew = that._prompterWindow.screenTop;
        	var isWinowMoving = (((xNew - xOld) * (xNew - xOld) + (yNew - yOld) * (yNew - yOld)) > 0);
        	xOld = xNew;
        	yOld = yNew;
        	var isWindowOn2ndMonitorRight = (that._prompterWindow.screenLeft >= mainScreenWidth);
            if (!isWinowMoving && isWindowOn2ndMonitorRight) {
                that._prompterWindow.moveTo(mainScreenWidth, 0);
                that._prompterWindow.resizeTo(that._prompterWindow.screen.availWidth, that._prompterWindow.screen.availHeight);
                isWindowFit = (that._prompterWindow.outerWidth > 400);
                if (isWindowFit) {
                	count++
			        if (count > 2) {
			        	that._prompterWindow.removeEventListener('drop', autoFitWindow);
			        	clearInterval(intervalID);
                	return
					}
                } else count = 0;
            }
        }
    });
}