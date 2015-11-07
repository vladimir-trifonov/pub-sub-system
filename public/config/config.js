'use strict';
var ns = ns || {};

(function(app) {
	var config = {
		pubClient: {
			publisherConnStr: 'ws://localhost:3001/websocket',
			clientConnStr: 'ws://localhost:3001/websocket'
		},
		chat: {
			chatConnStr: 'ws://localhost:3001/websocket'
		}
	};

	app.config = config;
})(ns);