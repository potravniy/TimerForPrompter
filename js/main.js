window.onload = function () {
    var Controller = require('./controller.js');
    var PrompterWindowController = require("./prompterWindowCtrl.js");
	var View = require("./view.js");
    var Messenger = require("./messenger.js");
    require('./secondsEventEmitter.js');

    window.Tmr = {
        $body: document.querySelector("body"),
        prompterWindow: null,
        state: {
            _prompterSt: "prompter-off",
            prompterSet: function(str){
                if(str==="prompter-off" || str==="prompter-on") {
                    window.Tmr.state._prompterSt = str;
                    window.Tmr.state._send();
                } else throw Error;
            },
            _timerSt: "no-timer",
            timerSet: function(str){
                if(str==="up" || str==="up-paused"
                || str==="down" || str==="down-paused"
                || str==="ddln" || str==="no-timer") {
                    window.Tmr.state._timerSt = str;
                    window.Tmr.state._send();
                } else throw Error;
            },
            _timerOver: "nope",
            timerSetOver: function(str){
                if(str==="nope" || str==="over") {
                    window.Tmr.state._timerOver = str;
                    window.Tmr.state._send();
                } else throw Error;
            },
            _send: function(){
                window.Tmr.$body.className = window.Tmr.state._prompterSt + " " 
                + window.Tmr.state._timerSt + " " + window.Tmr.state._timerOver;
            }
        }
    };
    
	var timerController = new Controller();
    var prompterWindowController = new PrompterWindowController();
	var timerView = new View();
    var messengerView = new Messenger();
}