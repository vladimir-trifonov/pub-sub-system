'use strict';

var Q = require('q'),
	util = require('util'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	EventEmitter = require('events').EventEmitter;

/*
 * Ps-ws is ps submodule which uses websockets layer for communication.
 */
function PsWs(socket) {
	this.socket = socket;
	this.clients = {};

	EventEmitter.call(this);
	return this;
}

util.inherits(PsWs, EventEmitter);

var onmessage = _.curry(function(id, message) {
	try {
		var data = JSON.parse(message);
	} catch (e) {
		this.emit('error', 'Message parsing error');
	}

	if (data) {
		if (id !== null) {
			data = util._extend({
				id: id
			}, data);
		}

		this.emit('data', data);
	}
});

var onclose = function(id) {
	return function() {
		if (id !== null) {
			this.clients[id] = null;
		}
	}
}

var onconnection = _.curry(function(save, ws) {
	var id = (save ? uuid() : null);
	if (save) {
		this.clients[id] = ws;
	}

	ws.on('message', onmessage(id).bind(this));
	ws.on('close', onclose(id).bind(this));
});

PsWs.prototype.listen = function(save) {
	this.socket.on('connection', onconnection(save).bind(this));
}

PsWs.prototype.open = function() {
	return Q.Promise(function(resolve) {
		this.socket.on('open', function() {
			this.connection = this.socket;
			resolve();
		}.bind(this));
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

PsWs.prototype.send = function(type, msg) {
	try {
		if (this.connection) {
			this.connection.send(JSON.stringify(util._extend({
				type: type
			}, msg)));
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