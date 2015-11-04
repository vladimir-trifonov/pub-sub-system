/***																											*
 *** Ps library module - Uses Websockets for transport    *
 *** communication																				*
 ***																											*/
'use strict';

var Q = require('q'),
	util = require('util'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	WebSocket = require('ws'),
	EventEmitter = require('events').EventEmitter;

/*
 * Ps-ws base class
 */
function PsWs(socket) {
	this.socket = socket;
	this.clients = {};

	EventEmitter.call(this);
	return this;
}

util.inherits(PsWs, EventEmitter);

// Listens for new connections(Broker or client)
PsWs.prototype.listen = function(canSave) {
	this.socket.on('connection', onconnection(canSave).bind(this));
}

// Create new connection(Publisher or client)
PsWs.prototype.open = function(canSub) {
	return Q.Promise(function(resolve) {
		this.socket.on('open', function() {

			// Init Client or Publisher connections
			this.connection = this.socket;

			if (canSub) {
				this.connection.on('message', onmessage(null).bind(this));
			}

			resolve();
		}.bind(this));
	}.bind(this));
}

// Clear instances
PsWs.prototype.destroy = function() {
	if (this.connection) {
		this.connection = null;
	}

	if (this.socket) {
		this.socket = null;
	}
}

// Send new message through a websocket
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

// Notify client for updates
PsWs.prototype.notify = function(clientId, msg) {
	var clientSocket = this.clients[clientId];
	if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
		clientSocket.send(JSON.stringify(util._extend({
			type: 'notify'
		}, msg)));
	}
};

/**
 ** Ps-ws used methods
 **/

// Emit on new message received
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

// Emit on client's connection closed and clear stored instance
var onclose = function(id) {
	return function() {
		if (id !== null) {
			this.clients[id] = null;
			this.emit('close', id);
		}
	}
}

// Store clients connection and init events handlers on new connection received
var onconnection = _.curry(function(canSave, ws) {
	var id = (canSave ? uuid() : null);
	if (canSave) {
		this.clients[id] = ws;
	}

	ws.on('message', onmessage(id).bind(this));
	ws.on('close', onclose(id).bind(this));
});

/*
 * Dependency injection and classes exports
 */
function connect(socket) {
	return new PsWs(socket);
}

module.exports.connect = connect;