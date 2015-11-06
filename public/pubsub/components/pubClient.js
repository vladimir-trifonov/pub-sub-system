/* global */
'use strict';
var ns = ns || {};

(function(app) {
	var PubClient = function(parentSel) {
		app.Component.call(this, parentSel, '#pub-client', 'templates/pubClient.hbs');

		return this;
	};

	PubClient.prototype = (function() {
		var p = Object.create(app.Component.prototype);
		p.constructor = PubClient;

		p._initEventHandlers = function() {
		};

		p._removeEventHandlers = function() {
		};

		return p;
	}());

	app.PubClient = PubClient;
})(ns);