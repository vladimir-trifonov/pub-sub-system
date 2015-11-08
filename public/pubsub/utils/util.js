"use strict";
var ns = ns || {};

(function(app) {
	String.prototype.replaceAll = function(find, replace) {
		var result = this;
		do {
			var split = result.split(find);
			result = split.join(replace);
		} while (split.length > 1);
		return result;
	};

	var utils = {
		replaceNewline: function(input) {
			var newline = String.fromCharCode(13, 10);
			return input.replaceAll('\\n', newline);
		}
	};

	app.utils = utils;
})(ns);