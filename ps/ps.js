/***																											*
 *** Ps library - Publish-Subscribe based library					*
 *** ---------------------------------------------------- *
 *** Has 3 modules - broker, client and publisher. The 		*
 *** publisher sends new messages to channels. The client	*
 *** listens for channels updates. The broker manages   	*
 *** the communication between clients and publishers.    *
 ***																											*/
'use strict';

var util = require('util'),
	_ = require('lodash'),
	EventEmitter = require('events').EventEmitter;

/**
 ** Ps base class
 **/
function Ps(options) {
	this.options = options;

	if (!options.socket) {
		throw new Error('No socket connection');
	}

	this.connection = require('./ps-ws').connect(options.socket);
}

/**
 ** Broker - extends Ps
 **/
function Broker(options) {
	Ps.call(this, {
		socket: options.socket
	});

	if (!options.redis || !options.mongo) {
		throw new Error('Missing db');
	}

	this.db = require('./ps-db').client(options.redis, options.mongo);

	this.connection.listen(true);
	this.connection.on('data', ondata.bind(this));
	this.connection.on('close', onclose.bind(this));

	EventEmitter.call(this);
	return this;
}

Broker.prototype = Ps;
Broker.prototype.constructor = Broker;

util.inherits(Broker, EventEmitter);

/**
 ** Publisher - extends Ps
 **/
function Publisher(options) {
	Ps.call(this, {
		socket: options.socket
	});

	this.connection.open();
}

Publisher.prototype = Ps;
Publisher.prototype.constructor = Publisher;

Publisher.prototype.send = function(msg) {
	if (!this.connection) {
		throw new Error('No connection established');
	}

	try {
		this.connection.send('publish', msg);
	} catch (e) {
		throw e;
	}
}

Publisher.prototype.destroy = function() {
	if (this.connection) {
		this.connection.destroy();
	}

	this.connection = null;
}

/**
 ** Client - extends Ps
 **/
function Client(options) {
	Ps.call(this, {
		socket: options.socket
	});

	this.channels = options.channels;

	this.connection.open(true)
		.then(subscribe(this.channels).bind(this));
	this.connection.on('data', ondata.bind(this));

	EventEmitter.call(this);
	return this;
}

Client.prototype = Ps;
Client.prototype.constructor = Client;

util.inherits(Client, EventEmitter);

/**
 ** Common used methods
 **/

// 1. Broker handles data received from the publishers and clients(types: publish, subscribe)
// 2. Client Handle data received from the broker(type: notify)
function ondata(data) {
	switch (data.type) {
		case 'publish':
			saveMsg.call(this, data.channel, data.msg);
			onNewData.call(this, data.channel, data.msg);
			break;
		case 'subscribe':
			chsSub.call(this, data.id, data.channels);
			onNewSubscr.call(this, data.id, data.channels);
			break;
		case 'notify':
			onNewNotifications.call(this, data.notifications);
			break;
	}
}

/**
 ** Broker's used methods
 **/

// Store to db the new message received from a publisher
function saveMsg(channel, msg) {
	return this.db.saveMsg(channel, msg);
}

// Notify on channel's update
function onNewData(channel, msg) {
	emitData.call(this, channel, msg);
	notifyChannel.call(this, channel, msg);
}

// Subscribe a client to channels' updates
function chsSub(id, channels) {
	return this.db.chsSub(id, channels);
}

// Notify on client's channel subscription
function onNewSubscr(id, channels) {
	this.emit('data', {
		id: id,
		channels: channels
	});
	sendLast.call(this, id, channels);
}

// Prepare data received from client and emit
function onNewNotifications(data) {
	_.each(Object.keys(data), function(ch) {
		_.each(data[ch], emitData(ch).bind(this));
	}.bind(this));
}

// Emit received data from client
var emitData = _.curry(function(channel, msg) {
	this.emit('data', '[ ' + channel + ' ] ' + msg);
});

// Send to client the last messages when subscribe to channel's update
function sendLast(subscr, channels) {
	this.db.getLastMsgs(channels)
		.then(function(data) {
			this.connection.notify(subscr, {
				notifications: data
			});
		}.bind(this));
}

// Cancel client's onUpdate subscription on connection closed
function onclose(id) {
	this.db.chsUnsub(id);
}

// Notify clients on channel update
function notifyChannel(channel, msg) {
	getChSubs.call(this, channel)
		.then(notifySubs(channel, [msg]).bind(this));
}

function getChSubs(channel) {
	return this.db.getChSubs(channel);
}

var notifySubs = _.curry(function(channel, msgs, subscrs) {
	_.each(subscrs, function(subscr) {
		var data = {};
		data[channel] = msgs;

		this.connection.notify(subscr, {
			notifications: data
		});
	}.bind(this));
});

/**
 ** Client's used methods
 **/

// Sends client's channels subscription to central server
function subscribe(channels) {
	return function() {
		try {
			this.connection.send('subscribe', {
				channels: channels
			});
		} catch (e) {
			throw e;
		}
	}
}

/*
 * Dependency injection and classes exports
 */
function broker(options) {
	return new Broker(options);
}

function publisher(options) {
	return new Publisher(options);
}

function client(options) {
	return new Client(options);
}

module.exports.broker = broker;
module.exports.publisher = publisher;
module.exports.client = client;