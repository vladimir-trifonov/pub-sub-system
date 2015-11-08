 /*** 																										*
 *** Chat component																				*
 ***																											*/
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

		// Initialize component's events handlers
		p._initEventHandlers = function() {
			this.$el.on('click.' + this.ns, '#to-publish', this._onPublish.bind(this));
		};

		// Subscribe to channels
		p._subscrTo = function(chatChannel) {
			this._send.call(this.chat, {
				type: 'subscribe',
				channels: [chatChannel]
			});
		}

		// Send new message
		p._onPublish = function(e) {
			e.preventDefault();

			var $messageEl = this.$el.find('input[name=message]');
			var $nickEl = this.$el.find('input[name=nickname]');

			this._send.call(this.chat, {
				type: 'publish',
				channel: app.chatChannel,
				msg: {
					nickname: $nickEl.val(),
					text: $messageEl.val()
				}
			});

			$messageEl.val('');
		}

		// Removes component's events handlers
		p._removeEventHandlers = function() {
			this.$el.off('click.' + this.ns, '#to-publish');
		};

		// After base class initialize
		p._afterInit = function() {
			this.$el = $(this.parentSel).find(this.sel);
			this.$msgEl = this.$el.find('.chat-messages');

			this.chat = new app.Messages(this.config.chatConnStr, true);

			this._initWsEventHandlers();
		};

		// Initializes web socket's events handlers
		p._initWsEventHandlers = function() {
			this.chat.addEventListener('connect', this._onWsConnected.call(this, this.chat, app.chatChannel));
			this.chat.addEventListener('disconnect', this._onWsDisconnected.call(this, this.chat));
		};

		// Remove web socket's events handlers
		p._removeWsEventHandlers = function() {
			this.chat.removeEventListener('connect');
			this.chat.removeEventListener('disconnect');
		};

		// Before the component's destroy
		p._beforeDestroy = function() {
			this._removeWsEventHandlers();

			this.chat.close();
			this.chat = null;
		};

		// On new web socket connect
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

		// On web socket disconnect
		p._onWsDisconnected = function(instance) {
			return function() {
				instance.removeEventListener('message');
			}.bind(this);
		}

		// Sends new message to channel
		p._send = function(message) {
			this.send(message);
		}

		// Displays new message
		p._onNewNotifications = function(data) {
			_.map(Object.keys(data.notifications), function(ch) {
				_.map(data.notifications[ch], this._renderMsgs(ch).bind(this));
			}.bind(this));
		}

		// Adds new messages to the dom
		p._renderMsgs = _.curry(function(channel, msg) {
			if(msg !== null) {
				this.$msgEl.text(app.utils.replaceNewline(this.$msgEl.text() + '\n' + (msg.nickname || 'Anonimous') + ' said: ' + (msg.text || '')));
				$('.chat-messages').scrollTop($('.chat-messages')[0].scrollHeight);
			}
		});


		return p;
	}());

	app.Chat = Chat;
})(ns);