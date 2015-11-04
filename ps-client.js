'use strict';

var port = process.argv[2] || 3001,
	WebSocket = require('ws'),
	ws = new WebSocket('ws://localhost:' + port),
	_ = require('lodash'),
	ps = require('./server/common/ps');

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
	return ps.client({
		socket: ws,
		channels: channels
	});
}

var initClient =_.flowRight(subscribe, getChannels);
initClient();