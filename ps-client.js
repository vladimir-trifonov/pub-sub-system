/***																											*
 *** Publish-Subscribe based Client - using Ps library		*
 *** ---------------------------------------------------- *
 *** This module is connected through webscoket 					*
 *** to connection to central serverand listens for 			*
 *** new messages																					*
 *** Usage: > node ps-client <port> <channel names>				*
 ***																											*/
'use strict';

var port = process.argv[2],
	WebSocket = require('ws'),
	ws = new WebSocket('ws://localhost:' + port),
	_ = require('lodash'),
	ps = require('./ps/ps');

// Parse the command line for channels need to being subscribed
var getChannels = function() {
	var cnt = 0;
	return _.chain(process.argv)
		.filter(function() {
			if (cnt < 3) {
				cnt++;
				return false;
			}

			return true;
		})
		.value();
}

// Subscribe the client for channels updates
var subscribe = function(channels) {
	var client = ps.client({
		socket: ws,
		channels: channels
	});

	client.on('data', console.log);
}

/**
 ** Start Client
 ** This function listens for channels updates and display the new messages
 ** on the console.
 **/
var initClient = _.flowRight(subscribe, getChannels);
initClient();