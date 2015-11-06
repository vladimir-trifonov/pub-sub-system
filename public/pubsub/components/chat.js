/* global */
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

		p._initEventHandlers = function() {};

		p._removeEventHandlers = function() {};

		p._afterInit = function() {};

		p._beforeDestroy = function() {};

		return p;
	}());

	app.Chat = Chat;
})(ns);