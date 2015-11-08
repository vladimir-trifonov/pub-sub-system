 /*** 																										*
 *** Websocket's messages service													*
 ***																											*/
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

		// Creates websocket's connection and connect to server
		p.connect = function() {
			this.socket = new WebSocket(this.connectionStr, 'echo-protocol');
			this._initEventHandlers();
		};

		// Closes the websocket's connection
		p.close = function() {
			this.socket.close();
			this.socket = null;
		};

		// Send a message
		p.send = function(data) {
			this._waitForConnection(function() {
				this.socket.send(JSON.stringify(data));
			}.bind(this), 1000);
		};

		// Wait until the connection is ready and send the message
		p._waitForConnection = function(callback, interval) {
			if(!this.socket) {
				return;
			}

			if (this.socket.readyState === 1) {
				callback();
			} else {
				setTimeout(function() {
					this._waitForConnection(callback, interval);
				}.bind(this), interval);
			}
		};

		// Initialize websocket's events handlers
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

			// If the client should listens for incomming messages
			if (this.canListen) {
				this.socket.onmessage = function(e) {
					var data = {};

					try {
						data = JSON.parse(e.data);
					} catch (err) {
						return this.dispatchEvent({
							type: 'error',
							message: err
						});
					}

					this.dispatchEvent({
						type: 'message',
						message: data
					});
				}.bind(this);
			}
		};

		return p;
	}());

	app.Messages = Messages;
})(ns);