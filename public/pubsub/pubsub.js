/* global $, Handlebars */
'use strict';
var ns = ns || {};

(function(app) {
	var Pubsub = function(selector) {
		this._compile(selector);

		return this;
	};

	Pubsub.prototype = (function() {
		var p = Object.create(null);
		p.constructor = Pubsub;

		p._compile = function(selector) {
			$.get("templates/pubsub.hbs").then(function(src) {
				this.tpl = Handlebars.compile(src)();

				this._render(selector);
				this._renderMenu();
			}.bind(this));
		};

		p._render = function(selector) {
			$(selector).append(this.tpl);
			this._initEventHandlers();
		};

		p._renderMenu = function() {
			app.menu = new app.Menu('#left-sidebar');
		};

		p._initEventHandlers = function() {};

		return p;
	}());

	app.Pubsub = Pubsub;
})(ns);