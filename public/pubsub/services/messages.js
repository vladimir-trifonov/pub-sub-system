/* global EventDispatcher */
'use strict';
var ns = ns || {};

(function(app) {
	function Messages(connectionStr, canListen) {
		EventDispatcher.prototype.apply(this);
		this.connectionStr = connectionStr;
		this.canListen = canListen;

		this.connect();
		return this;
	}

	Messages.prototype = (function() {
		var p = Object.create({});
		p.constructor = Messages;

		p.connect = function() {
			this.socket = new WebSocket(this.connectionStr);
			this._initEventHandlers();
		};

		p.close = function() {
			this.socket.close();
			this.socket = null;
		};

		p.send = function(data) {
			this._waitForConnection(function() {
				this.socket.send(JSON.stringify(data));
			}.bind(this), 1000);
		};

		p._waitForConnection = function(callback, interval) {
			if (this.socket.readyState === 1) {
				callback();
			} else {
				setTimeout(function() {
					this.waitForConnection(callback, interval);
				}.bind(this), interval);
			}
		};

		p._initEventHandlers = function() {
			this.socket.onopen = function() {
				this.dispatchEvent({
					type: 'connect'
				});
			}.bind(this);

			this.socket.onclose = function() {
				this.dispatchEvent({
					type: 'disconnect'
				});
			}.bind(this);

			if (this.canListen) {
				this.socket.onmessage = function(e) {
					this.dispatchEvent({
						type: 'message',
						message: e.data
					});
				}.bind(this);
			}
		};

		return p;
	}());

	app.Messages = Messages;
})(ns);