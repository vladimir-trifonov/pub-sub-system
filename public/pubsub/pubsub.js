 /*** 																										*
 *** Main component																				*
 ***																											*/
/* global $, Handlebars */
'use strict';
var ns = ns || {};

(function(app) {
	var Pubsub = function(parentSel) {
		this.menu = null;

		this.parentSel = parentSel;
		this._compile();

		return this;
	};

	Pubsub.prototype = (function() {
		var p = Object.create(null);
		p.constructor = Pubsub;

		// Compiles the dom element
		p._compile = function() {
			$.get('templates/pubsub.hbs').then(function(src) {
				this.tpl = Handlebars.compile(src)();

				this._render();
				this._renderMenu();
				this._initEventHandlers();
			}.bind(this));
		};

		// Renders the component
		p._render = function() {
			$(this.parentSel).append(this.tpl);
		};

		// Renders the main menu component
		p._renderMenu = function() {
			this.menu = new app.Menu('#left-sidebar');
		};

		// Initialize component's events handlers
		p._initEventHandlers = function() {
			this.menu.addEventListener('pubClient', function() {
				if(this.mainContent) {
					this.mainContent.destroy();
				}

				this.mainContent = new app.PubClient('#main-content');
			}.bind(this));

			this.menu.addEventListener('chat', function() {
				if(this.mainContent) {
					this.mainContent.destroy();
				}

				this.mainContent = new app.Chat('#main-content');
			}.bind(this));
		};

		return p;
	}());

	app.Pubsub = Pubsub;
})(ns);