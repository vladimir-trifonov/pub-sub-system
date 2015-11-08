 /*** 																										*
 *** Menu component																				*
 ***																											*/
/* global $, Handlebars, EventDispatcher */
'use strict';
var ns = ns || {};

(function(app) {
	var Menu = function(parentSel) {
		EventDispatcher.prototype.apply(this);

		this.parentSel = parentSel;
		this.sel = '#main-menu';
		this.compile();

		return this;
	};

	Menu.prototype = (function() {
		var p = Object.create({});
		p.constructor = Menu;

		// Compiles the dom element
		p.compile = function() {
			$.get('templates/menu.hbs').then(function(src) {
				this.tpl = Handlebars.compile(src)();

				this._render();
				this._initEventHandlers();
			}.bind(this));
		};

		// Renders the component
		p._render = function() {
			$(this.parentSel).append(this.tpl);
		};

		// Initialize component's events handlers
		p._initEventHandlers = function() {
			var _self = this;
			$(this.parentSel).find(this.sel).on('click', 'a', function(e) {
				e.preventDefault();

				var evType = $(this).attr('data-ev');
				_self.dispatchEvent( { type: evType } );
			});
		};

		return p;
	}());

	app.Menu = Menu;
})(ns);