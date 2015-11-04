'use strict';

var port = process.argv[2],
	WebSocket = require('ws'),
	ws = new WebSocket('ws://localhost:' + port),
	_ = require('lodash'),
	ps = require('./ps/ps'),
	publisher = ps.publisher({
		socket: ws
	});

var parse = function(chunk) {
	var data;
	if (typeof chunk === 'string' && _.isArray(data = chunk.split(' '))) {
		return {
			channel: data[0].trim(),
			msg: ((data.slice(1, data.length)).join(' ')).replace(/(\n|\r)+$/, '')
		}
	}

	return null;
}

var send = _.curry(function(to, data) {
	if (data !== null) {
		try {
			to.send(data);
		} catch (e) {
			console.log(e);
		}
	}
});

var initPublisher = function() {
	var proceed = _.flowRight(send(publisher), parse);
	var onRead = function() {
		var chunk = process.stdin.read();
		if (chunk !== null) {
			proceed(chunk);
		}
	}

	process.stdin.setEncoding('utf8');
	process.stdin.on('readable', onRead);
	process.stdin.on('end', publisher.destroy);
}

initPublisher();