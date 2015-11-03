'use strict';
/*
 *
 *
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
	this.socket.on('open', function(ws) {
		that.connection = that.socket;
	});
}

PsWs.prototype.send = function(msg) {
	this.connection.send(msg);
}

function connect(socket) {
  return new PsWs(socket);
}

module.exports.connect = connect;