/* global $, Handlebars */
'use strict';
var ns = ns || {};

(function(app) {
	var Menu = function(selector) {
		this.compile(selector);
		return this;
	};

	Menu.prototype = (function() {
		var p = Object.create(null);
		p.constructor = Menu;

		p.compile = function(selector) {
			$.get("templates/menu.hbs").then(function(src) {
				this.tpl = Handlebars.compile(src)();
				this._render(selector);
			}.bind(this));
		};

		p._render = function(selector) {
			$(selector).append(this.tpl);
			this._initEventHandlers();
		};

		p._initEventHandlers = function() {};

		return p;
	}());

	app.Menu = Menu;
})(ns);