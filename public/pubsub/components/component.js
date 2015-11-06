/* global $, Handlebars, EventDispatcher */
'use strict';
var ns = ns || {};

(function(app) {
	var Component = function(parentSel, sel, templatePath) {
		EventDispatcher.prototype.apply(this);

		this.templatePath = templatePath;
		this.parentSel = parentSel;
		this.sel = sel;
		this.compile();

		return this;
	};

	Component.prototype = (function() {
		var p = Object.create({});
		p.constructor = Component;

		p.compile = function() {
			$.get(this.templatePath).then(function(src) {
				this.tpl = Handlebars.compile(src)();

				this._render();
				setTimeout(function() {
					this._initEventHandlers();
				}.bind(this), 10);
			}.bind(this));
		};

		p.destroy = function() {
			this._removeEventHandlers();
			$(this.sel).remove();
		};

		p._render = function() {
			$(this.parentSel).append(this.tpl);
			setTimeout(function() {
				$(this.sel).show(500);
			}.bind(this), 10);
		};

		p._initEventHandlers = function() {
			// Virtual
		};
		p._removeEventHandlers = function() {
			// Virtual
		};

		return p;
	}());

	app.Component = Component;
})(ns);