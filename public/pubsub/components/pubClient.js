/* global $ */
'use strict';
var ns = ns || {};

(function(app) {
	var PubClient = function(parentSel) {
		app.Component.call(this, 'pubClient', parentSel, '#pub-client', 'templates/pubClient.hbs');

		return this;
	};

	PubClient.prototype = (function() {
		var p = Object.create(app.Component.prototype);
		p.constructor = PubClient;

		p._initEventHandlers = function() {
			$(this.parentSel).find(this.sel).on('click.' + this.ns, '#to-subscribe', function(e) {
				e.preventDefault();

				var $elCh = $('input[name=to-subscribe]');
				var channels = $elCh.val().split(' ');

				this._send.call(this.client, {
					type: 'subscribe',
					channels: [channels]
				});

				this._addSubscr(channels)
				$elCh.val('');
			}.bind(this));

			$(this.parentSel).find(this.sel).on('click.' + this.ns, '#to-publish', function(e) {
				e.preventDefault();

				var $toChEl = $(this.parentSel).find('input[name=to-channel]');
				var $toPublishEl = $(this.parentSel).find('input[name=to-publish]');

				this._send.call(this.publisher, {
					type: 'publish',
					channel: $toChEl.val(),
					msg: $toPublishEl.val()
				});

				$toChEl.val('')
				$toPublishEl.val('')
			}.bind(this));
		};

		p._removeEventHandlers = function() {
			$(this.parentSel).find(this.sel).off('click.' + this.ns, '#to-subscribe');
			$(this.parentSel).find(this.sel).off('click.' + this.ns, '#to-publish');
		};

		p._afterInit = function() {
			this.publisher = new app.Messages(this.config.publisherConnStr);
			this.client = new app.Messages(this.config.clientConnStr, true);

			this._initWsEventHandlers();
		};

		p._initWsEventHandlers = function() {
			this.client.addEventListener('connect', this._onWsConnected.call(this, this.client));
			this.client.addEventListener('disconnect', this._onWsDisconnected.call(this, this.client));
		};

		p._removeWsEventHandlers = function() {
			this.publisher.removeEventListener('connect');
			this.publisher.removeEventListener('disconnect');
			this.client.removeEventListener('connect');
			this.client.removeEventListener('disconnect');
		};

		p._beforeDestroy = function() {
			this._removeWsEventHandlers();

			this.publisher.close();
			this.client.close();

			this.publisher = null;
			this.client = null;
		};

		p._onWsConnected = function(instance) {
			return function() {
				instance.addEventListener('message', function(e) {
					this._printMsgs(e.message);
				}.bind(this));
			}.bind(this);
		}

		p._onWsDisconnected = function(instance) {
			return function() {
				instance.removeEventListener('message');
			}.bind(this);
		}

		p._send = function(message) {
			this.send(message);
		}

		p._addSubscr = function(channels) {
			console.log(channels);
		}

		p._printMsgs = function(msgs) {
			console.log(msgs);
		}

		return p;
	}());

	app.PubClient = PubClient;
})(ns);