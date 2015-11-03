'use strict';

/*
 * Ps submodule whick uses websockets layer for communication.
 */
function PsWs(socket) {
	this.socket = socket;
}

PsWs.prototype.listen = function() {
	this.socket.on('connection', function(ws) {
		ws.on('message', function(message) {
			console.log(message);
		});
	});
}

PsWs.prototype.open = function() {
	var that = this;
	this.socket.on('open', function() {
		that.connection = that.socket;
	});
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
	if (this.connection) {
		this.connection.send(msg);
	}
}

function connect(socket) {
	return new PsWs(socket);
}

module.exports.connect = connect;