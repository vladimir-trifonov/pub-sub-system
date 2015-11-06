'use strict';
var ns = ns || {};

(function(app) {
	var config = {
		pubClient: {
			publisherConnStr: 'ws://localhost:3001/',
			clientConnStr: 'ws://localhost:3001/'
		},
		chat: {
			chatConnStr: 'ws://localhost:3001/'
		}
	};

	app.config = config;
})(ns);