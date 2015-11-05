/* global $, Handlebars */
'use strict';
var ns = ns || {};

(function(app) {
	var Menu = function(selector) {
		this.selector = selector;
		this.compile();

		return this;
	};

	Menu.prototype = (function() {
		var p = Object.create(null);
		p.constructor = Menu;

		p.compile = function() {
			$.get('templates/menu.hbs').then(function(src) {
				this.tpl = Handlebars.compile(src)();
				this._render();
			}.bind(this));
		};

		p._render = function() {
			$(this.selector).append(this.tpl);
			this._initEventHandlers();
		};

		p._initEventHandlers = function() {};

		return p;
	}());

	app.Menu = Menu;
})(ns);