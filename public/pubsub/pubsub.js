/* global $, Handlebars */
'use strict';
var ns = ns || {};

(function(app) {
	var Pubsub = function(selector) {
		this.selector = selector;
		this._compile();

		return this;
	};

	Pubsub.prototype = (function() {
		var p = Object.create(null);
		p.constructor = Pubsub;

		p._compile = function() {
			$.get('templates/pubsub.hbs').then(function(src) {
				this.tpl = Handlebars.compile(src)();

				this._render();
				this._renderMenu();
			}.bind(this));
		};

		p._render = function() {
			$(this.selector).append(this.tpl);
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