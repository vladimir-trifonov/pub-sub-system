 /*** 																										*
 *** Native classes extends																*
 ***																											*/
"use strict";
var ns = ns || {};

(function() {

	// Extends string object's functionality
	String.prototype.replaceAll = function(find, replace) {
		var result = this;
		do {
			var split = result.split(find);
			result = split.join(replace);
		} while (split.length > 1);
		return result;
	};
})(ns);