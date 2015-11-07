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

		p._initEventHandlers = function() {
			this.$el.on('click.' + this.ns, '#to-subscribe', this._onSubscr.bind(this));
			this.$el.on('click.' + this.ns, '#to-publish', this._onPublish.bind(this));
		};

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

		p._removeEventHandlers = function() {
			this.$el.off('click.' + this.ns, '#to-subscribe');
			this.$el.off('click.' + this.ns, '#to-publish');
		};

		p._afterInit = function() {
			this.$el = $(this.parentSel).find(this.sel);
			this.$msgEl = this.$el.find('.messages');

			this.publisher = new app.Messages(this.config.publisherConnStr, true);
			this.client = new app.Messages(this.config.clientConnStr, true);

			this._initWsEventHandlers();
		};

		p._initWsEventHandlers = function() {
			this.client.addEventListener('connect', this._onWsConnected.call(this, this.client));
			this.client.addEventListener('disconnect', this._onWsDisconnected.call(this, this.client));
		};

		p._removeWsEventHandlers = function() {
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
					if (e.message.type === 'notify') {
						this._onNewNotifications(e.message);
					}
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

		p._onNewNotifications = function(data) {
			_.each(Object.keys(data.notifications), function(ch) {
				_.each(data.notifications[ch], this._renderMsgs(ch).bind(this));
			}.bind(this));
		}

		p._renderMsgs = _.curry(function(channel, msg) {
			this.$msgEl.append('<div class="msg-item"><span><small>topic:&nbsp;</small>' + channel + '</span><span><small>message:&nbsp;</small>' + msg + '</span></div>')
		});

		return p;
	}());

	app.PubClient = PubClient;
})(ns);