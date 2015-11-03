'use strict';

var util = require('util'),
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

	if (options.redis) {
		this.db = require('./ps-redis').client(options.redis);
	}
}

/*
 * Broker implementation.
 */
var newData = function(data) {
	this.emit('data', data);
}
var ondata = function(data) {
	dbStore.call(this, data)
		.then(function(){
			newData.call(this, data);
		}.bind(this));
}

var dbStore = function(data) {
	return this.db.store(data.channel, data.msg);
}

function Broker(options) {
	Ps.call(this, options);

	this.connection.listen();
	this.connection.on('data', ondata.bind(this));

	EventEmitter.call(this);
	return this;
}

Broker.prototype = Ps;
Broker.prototype.constructor = Broker;

util.inherits(Broker, EventEmitter);

/*
 * Publisher implementation.
 */
function Publisher(options) {
	Ps.call(this, options);
	this.connection.open();
}

Publisher.prototype = Ps;
Publisher.prototype.constructor = Publisher;

Publisher.prototype.send = function(msg) {
	if (!this.connection) {
		throw new Error('No connection established');
	}

	try {
		this.connection.send(msg);
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
 * Client implementation.
 */
function Client(options) {
	Ps.call(this, options);
}

Client.prototype = Ps;
Client.prototype.constructor = Client;

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