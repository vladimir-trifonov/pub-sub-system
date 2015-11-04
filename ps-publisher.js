/***																											*
 *** Publish-Subscribe based Publisher - using Ps library	*
 *** ---------------------------------------------------- *
 *** This module listens for console input and sends it		*
 *** through webscoket connection	to central server				*
 *** Usage: > node ps-publisher <port>										*
 ***																											*/
'use strict';

var port = process.argv[2],
	WebSocket = require('ws'),
	ws = new WebSocket('ws://localhost:' + port),
	_ = require('lodash'),
	ps = require('./ps/ps'),
	publisher = ps.publisher({
		socket: ws
	});

// Parse the console input to following format:
// -> Input -> test hello!
// -> Parsed: { channel: test, msg: 'hello!' }
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

// Sends the new messages to Ps(Pub-sub) module
var send = _.curry(function(to, data) {
	if (data !== null) {
		try {
			to.send(data);
		} catch (e) {
			console.log(e);
		}
	}
});

// Listen for input from console, parse it and sends it to Ps(Pub-sub) module
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

/**
 ** Start Publisher
 ** This function listen on console for input and started web socket connection ready to publish
 ** the input from the console.
 **/
initPublisher();