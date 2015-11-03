'use strict';

var debug = require('debug')('ps');

/*
 *
 *
 */
function Ps(options) {
  this.options = options;

  if(!options.socket) {
  	throw new Error('No connection!');
  }

  this.connection = require('./ps-ws').connect(options.socket);
}

/*
 *
 *
 */
function Broker(options) {
	Ps.call(this, options);
	this.connection.listen();
}

Broker.prototype = Ps;
Broker.prototype.constructor = Broker;

/*
 *
 *
 */
function Publisher(options) {
	Ps.call(this, options);
	this.connection.open();
}

Publisher.prototype = Ps;
Publisher.prototype.constructor = Publisher;

Publisher.prototype.send = function(msg) {
	this.connection.send(msg);
}

Publisher.prototype.destroy = function() {
}

/*
 *
 *
 */
function Client(options) {
	Ps.call(this, options);
}

Client.prototype = Ps;
Client.prototype.constructor = Client;

/*
 *
 *
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

