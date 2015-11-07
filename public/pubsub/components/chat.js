/* global $, _ */
'use strict';
var ns = ns || {};

(function(app) {
	var Chat = function(parentSel) {
		app.Component.call(this, 'chat', parentSel, '#chat', 'templates/chat.hbs');

		return this;
	};

	Chat.prototype = (function() {
		var p = Object.create(app.Component.prototype);
		p.constructor = Chat;

		p._initEventHandlers = function() {
			this.$el.on('click.' + this.ns, '#to-publish', this._onPublish.bind(this));
		};

		p._subscrTo = function(channels) {
			this._send.call(this.chat, {
				type: 'subscribe',
				channels: channels
			});
		}

		p._onPublish = function(e) {
			e.preventDefault();

			var $toChEl = this.$el.find('input[name=to-channel]');
			var $toPublishEl = this.$el.find('input[name=to-publish]');

			this._send.call(this.chat, {
				type: 'publish',
				channel: $toChEl.val(),
				msg: $toPublishEl.val()
			});

			$toChEl.val('')
			$toPublishEl.val('')
		}

		p._removeEventHandlers = function() {
			this.$el.off('click.' + this.ns, '#to-publish');
		};

		p._afterInit = function() {
			this.$el = $(this.parentSel).find(this.sel);
			this.$msgEl = this.$el.find('.messages');

			this.chat = new app.Messages(this.config.chatConnStr, true);

			this._initWsEventHandlers();
		};

		p._initWsEventHandlers = function() {
			this.chat.addEventListener('connect', this._onWsConnected.call(this, this.chat, app.channels));
			this.chat.addEventListener('disconnect', this._onWsDisconnected.call(this, this.chat));
		};

		p._removeWsEventHandlers = function() {
			this.chat.removeEventListener('connect');
			this.chat.removeEventListener('disconnect');
		};

		p._beforeDestroy = function() {
			this._removeWsEventHandlers();

			this.chat.close();
			this.chat = null;
		};

		p._onWsConnected = function(instance, channels) {
			return function() {
				this._subscrTo(channels);

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

	app.Chat = Chat;
})(ns);