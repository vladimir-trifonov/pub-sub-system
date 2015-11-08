 /*** 																										*
 *** Base class - Component																*
 ***																											*/
/* global $, Handlebars, EventDispatcher */
'use strict';
var ns = ns || {};

(function(app) {
	var Component = function(ns, parentSel, sel, templatePath) {
		EventDispatcher.prototype.apply(this);

		this.templatePath = templatePath;
		this.parentSel = parentSel;
		this.sel = sel;
		this.config = app.config[ns];
		this.compile();

		return this;
	};

	Component.prototype = (function() {
		var p = Object.create({});
		p.constructor = Component;

		// Compiles the dom element
		p.compile = function() {
			$.get(this.templatePath).then(function(src) {
				this.tpl = Handlebars.compile(src)();

				this._render();
				this._afterInit();
				setTimeout(this._initEventHandlers.bind(this), 10);
			}.bind(this));
		};

		// Destroys the component
		p.destroy = function() {
			this._removeEventHandlers();
			this._beforeDestroy();

			$(this.parentSel).find(this.sel).remove();
		};

		// Renders the component
		p._render = function() {
			$(this.parentSel).append(this.tpl);
			setTimeout(function() {
				$(this.parentSel).find(this.sel).show(500);
			}.bind(this), 10);
		};

		// Virtual methods

		p._initEventHandlers = function() {
			// Virtual
		};
		p._removeEventHandlers = function() {
			// Virtual
		};

		p._afterInit = function() {
			// Virtual
		};
		p._beforeDestroy = function() {
			// Virtual
		};

		return p;
	}());

	app.Component = Component;
})(ns);