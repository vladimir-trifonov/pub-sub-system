'use strict';

/*
 * Ps is library implementing Publish-Subscribe pattern. The system
 * involves three major sub structures: broker, publisher and client.
 */
function Ps(options) {
	this.options = options;

	if (!options.socket) {
		throw new Error('No connection!');
	}

	this.connection = require('./ps-ws').connect(options.socket);
}

/*
 * Broker implementation.
 */
function Broker(options) {
	Ps.call(this, options);
	this.connection.listen();
}

Broker.prototype = Ps;
Broker.prototype.constructor = Broker;

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
 * Broker dependency injection and export
 */
function broker(options) {
	return new Broker(options);
}

module.exports.broker = broker;

/*
 * Publisher dependency injection and export
 */
function publisher(options) {
	return new Publisher(options);
}

module.exports.publisher = publisher;

/*
 * Client dependency injection and export
 */
function client(options) {
	return new Client(options);
}

module.exports.client = client;