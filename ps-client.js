'use strict';

var port = process.argv[2] || 3001,
	WebSocket = require('ws'),
	ws = new WebSocket('ws://localhost:' + port),
	_ = require('lodash'),
	ps = require('./ps/ps');

var getChannels = function() {
	var cnt = 0;
	return _.chain(process.argv)
		.filter(function() {
			if(cnt < 3) {
				cnt++;
				return false;
			}

			return true;
		})
		.value();
}

var subscribe = function(channels) {
	var client = ps.client({
		socket: ws,
		channels: channels
	});

	client.on('data', console.log);
}

var initClient =_.flowRight(subscribe, getChannels);
initClient();