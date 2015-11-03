'use strict';

var util = require('util'),
	EventEmitter = require('events').EventEmitter;

/*
 * Ps-ws is ps submodule which uses websockets layer for communication.
 */
function PsWs(socket) {
	this.socket = socket;

	EventEmitter.call(this);
	return this;
}

util.inherits(PsWs, EventEmitter);

var onconnection = function(ws) {
	ws.on('message', onmessage.bind(this));
}

var onmessage = function(message) {
	try {
		var data = JSON.parse(message);
		this.emit('data', data);
	} catch (e) {
		this.emit('err', 'Message parsing error');
	}
}

PsWs.prototype.listen = function() {
	this.socket.on('connection', onconnection.bind(this));
}

PsWs.prototype.open = function() {
	this.socket.on('open', function() {
		this.connection = this.socket;
	}.bind(this));
}

PsWs.prototype.destroy = function() {
	if (this.connection) {
		this.connection = null;
	}

	if (this.socket) {
		this.socket = null;
	}
}

PsWs.prototype.send = function(msg) {
	try {
		if (this.connection) {
			this.connection.send(msg);
		} else {
			throw new Error('No connection established')
		}
	} catch (e) {
		throw e;
	}
}

function connect(socket) {
	return new PsWs(socket);
}

module.exports.connect = connect;