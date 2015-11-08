 /*** 																										*
 *** Utils																								*
 ***																											*/
"use strict";
var ns = ns || {};

(function(app) {

	var utils = {
		replaceNewline: function(input) {
			var newline = String.fromCharCode(13, 10);
			return input.replaceAll('\\n', newline);
		}
	};

	app.utils = utils;
})(ns);