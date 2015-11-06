/* global EventDispatcher, io */
'use strict';
var ns = ns || {};

(function(app) {
	function Messages(connectionStr) {
		EventDispatcher.prototype.apply(this);
		this.connectionStr = connectionStr;

		return this;
	}

	Messages.prototype = (function() {
		var p = Object.create({});
		p.constructor = Messages;

		p.connect = function() {
			this.socket = io.connect(this.connectionStr);
			this._initEventHandlers();
		};

		p._initEventHandlers = function() {
			this.socket.on('connect', function() {
				this.dispatchEvent({
					type: 'connect'
				});
			}.bind(this));

			this.socket.on('disconnect', function() {
				this.dispatchEvent({
					type: 'disconnect'
				});
			});
		};

		return p;
	}());

	app.Messages = Messages;
})(ns);