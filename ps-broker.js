'use strict';

var port = process.argv[2] || 3001,
	redis = require('redis'),
	debug = require('debug')('ps-broker'),
	client = redis.createClient();

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
	debug('Error: ', err);
}

broker.on('data', debug);
broker.on('error', onerror);