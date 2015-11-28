window.addEventListener('load', maximize);

function maximize () {
    var mainScreenWidth = window.screen.width;
    var count = 0;
    var isWindowFit = false;
    var xOld = window.screenLeft || window.screenX;
    var yOld = window.screenTop || window.screenY;

    var intervalID = setInterval(autoFitWindow, 150);

    function autoFitWindow() {
		if    (window.document.fullscreenElement 
			|| window.document.webkitFullscreenElement 
			|| window.document.mozFullScreenElement 
			|| window.document.msFullscreenElement) {
        	clearInterval(intervalID);
        	return
	    }
	    var xNew = window.screenLeft || window.screenX;
        var yNew = window.screenTop || window.screenY;
    	var isWindowMoving = (((xNew - xOld) * (xNew - xOld) + (yNew - yOld) * (yNew - yOld)) > 0);
    	xOld = xNew;
    	yOld = yNew;
    	var isWindowOn2ndMonitorRight = ((window.screenLeft || window.screenX) >= mainScreenWidth);
        if (!isWindowMoving && isWindowOn2ndMonitorRight) {
            window.moveTo(mainScreenWidth, 0);
            window.resizeTo(window.screen.availWidth, window.screen.availHeight);
            isWindowFit = (window.outerWidth > 600);
            if (isWindowFit) {
            	count++
		        if (count > 2) {
		        	clearInterval(intervalID);
            	return
				}
            } else count = 0;
        }
    }
}
