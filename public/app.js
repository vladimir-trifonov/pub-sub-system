'use strict';
var ns = ns || {};

(function(app) {
	var App = {
		init: function() {
			new app.Pubsub('.content');
		}
	};

	app.App = App;
})(ns);

window.onload = function() {
	var app = Object.create(ns.App);
	app.init();
};