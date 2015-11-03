'use strict';

var port = process.argv[2] || 3001;

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: port
	});

var ps = require('./server/common/ps'),
	broker = ps.broker({
		socket: wss
	});