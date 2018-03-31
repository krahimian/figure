(function(root, factory) {

    root.App = factory(root);

})(this, function(root) {

    'use strict';

    var msgElement = document.getElementById('message');

    return {
	// Application Constructor
	initialize: function() {
            this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
	    this.receivedEvent('device ready');
	    StatusBar.hide();

	    setTimeout(function() {
		MINT.initialize();
	    }, 5000);
	},
	// Update DOM on a Received Event
	receivedEvent: function(message) {

	    msgElement.innerHTML = message;

	}	
	
    };
});

App.initialize();
