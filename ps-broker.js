'use strict';

var port = process.argv[2] || 3001;
var redis = require('redis');
var client = redis.createClient();

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: port
	});

var ps = require('./server/common/ps'),
	broker = ps.broker({
		socket: wss,
		redis: client
	});

var onerror = function(err) {
	console.log('Error: ', err);
}

broker.on('data', console.log);
broker.on('err', onerror);