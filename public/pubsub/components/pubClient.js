 /*** 																										*
 *** Publisher and client component												*
 ***																											*/
/* global $, _ */
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

		// Initialize component's events handlers
		p._initEventHandlers = function() {
			this.$el.on('click.' + this.ns, '#to-subscribe', this._onSubscr.bind(this));
			this.$el.on('click.' + this.ns, '#to-publish', this._onPublish.bind(this));
		};

		// Subscribe to channels
		p._onSubscr = function(e) {
			e.preventDefault();

			var $elCh = $('input[name=to-subscribe]');
			var channels = $elCh.val().split(' ');

			this._send.call(this.client, {
				type: 'subscribe',
				channels: channels
			});

			$elCh.val('');
		}

		// Send new message
		p._onPublish = function(e) {
			e.preventDefault();

			var $toChEl = this.$el.find('input[name=to-channel]');
			var $toPublishEl = this.$el.find('input[name=to-publish]');

			this._send.call(this.publisher, {
				type: 'publish',
				channel: $toChEl.val(),
				msg: $toPublishEl.val()
			});

			$toChEl.val('')
			$toPublishEl.val('')
		}

		// Removes component's events handlers
		p._removeEventHandlers = function() {
			this.$el.off('click.' + this.ns, '#to-subscribe');
			this.$el.off('click.' + this.ns, '#to-publish');
		};

		// After base class initialize
		p._afterInit = function() {
			this.$el = $(this.parentSel).find(this.sel);
			this.$msgEl = this.$el.find('.messages');

			this.publisher = new app.Messages(this.config.publisherConnStr);
			this.client = new app.Messages(this.config.clientConnStr, true);

			this._initWsEventHandlers();
		};

		// Initializes web socket's events handlers
		p._initWsEventHandlers = function() {
			this.client.addEventListener('connect', this._onWsConnected.call(this, this.client));
			this.client.addEventListener('disconnect', this._onWsDisconnected.call(this, this.client));
		};

		// Remove web socket's events handlers
		p._removeWsEventHandlers = function() {
			this.client.removeEventListener('connect');
			this.client.removeEventListener('disconnect');
		};

		// Before the component's destroy
		p._beforeDestroy = function() {
			this._removeWsEventHandlers();

			this.publisher.close();
			this.client.close();

			this.publisher = null;
			this.client = null;
		};

		// On new web socket connect
		p._onWsConnected = function(instance) {
			return function() {
				instance.addEventListener('message', function(e) {
					if (e.message.type === 'notify') {
						this._onNewNotifications(e.message);
					}
				}.bind(this));
			}.bind(this);
		}

		// On web socket disconnect
		p._onWsDisconnected = function(instance) {
			return function() {
				instance.removeEventListener('message');
			}.bind(this);
		}

		// Sends new message from publisher
		p._send = function(message) {
			this.send(message);
		}

		// Displays new message from client
		p._onNewNotifications = function(data) {
			_.map(Object.keys(data.notifications), function(ch) {
				_.map(data.notifications[ch], this._renderMsgs(ch).bind(this));
			}.bind(this));
		}

		// Adds new messages to the dom
		p._renderMsgs = _.curry(function(channel, msg) {
			this.$msgEl.append('<div class="msg-item"><span><span>topic:&nbsp;</span>' + channel + '</span><span><span>message:&nbsp;</span>' + msg + '</span></div>')
		});

		return p;
	}());

	app.PubClient = PubClient;
})(ns);