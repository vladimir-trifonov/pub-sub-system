 /*** 																										*
 *** Web application																			*
 *** Usage in browser: http://localhost:3000  						*
 ***																											*/
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

// Initialize the main app
window.onload = function() {
	var app = Object.create(ns.App);
	app.init();
};