'use strict';

var Q = require('q'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

/*
 * Ps is library implementing Publish-Subscribe pattern. The system
 * involves three major sub structures: broker, publisher and client.
 */
function Ps(options) {
	this.options = options;

	if (!options.socket) {
		throw new Error('No socket connection');
	}

	this.connection = require('./ps-ws').connect(options.socket);
}







/*
 * Broker implementation
 *
 *
 */
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

	EventEmitter.call(this);
	return this;
}

Broker.prototype = Ps;
Broker.prototype.constructor = Broker;

util.inherits(Broker, EventEmitter);

// Broker Functions

function ondata (data) {
	switch (data.type) {
		case 'publish':
			saveMsg.call(this, data.channel, data.msg);
			newData.call(this, data.channel, data.msg);
			break;
		case 'subscribe':
			subscrChannels.call(this, data.id, data.channels);
			newSubscr.call(this, data.id, data.channels);
			break;
	}
}

function notifyChannel() {

}

function initSubscriber() {

}

function newData(channel, msg) {
	this.emit('data', {
		channel: channel,
		msg: msg
	});
	notifyChannel(channel, msg);
}

function newSubscr(id, channels) {
	this.emit('data', {
		id: id,
		channels: channels
	});
	initSubscriber(id, channels);
}

function saveMsg(channel, msg) {
	if (!this.db) {
		return Q.reject('No db');
	}

	return this.db.saveMsg(channel, msg);
}

function subscrChannels(data) {
	if (!this.db) {
		return Q.reject('No db');
	}

	return this.db.subscrChannels(data);
}








/*
 * Publisher implementation
 *
 *
 */
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







/*
 * Client implementation
 *
 *
 */
function Client(options) {
	Ps.call(this, {
		socket: options.socket
	});

	this.channels = options.channels;

	this.connection.listen();
	this.connection.open()
		.then(subscribe(this.channels).bind(this));

	EventEmitter.call(this);
	return this;
}

Client.prototype = Ps;
Client.prototype.constructor = Client;

util.inherits(Client, EventEmitter);

function subscribe(channels) {
	return function() {
		try {
			this.connection.send('subscribe', {channels: channels});
		} catch (e) {
			throw e;
		}
	}
}







/*
 * Broker dependency injection
 */
function broker(options) {
	return new Broker(options);
}

module.exports.broker = broker;

/*
 * Publisher dependency injection
 */
function publisher(options) {
	return new Publisher(options);
}

module.exports.publisher = publisher;

/*
 * Client dependency injection
 */
function client(options) {
	return new Client(options);
}

module.exports.client = client;