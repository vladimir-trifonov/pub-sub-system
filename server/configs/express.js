/**
 * Express configuration
 */
'use strict';

var express = require('express');

module.exports = function(app, config) {
	app.set('views', config.rootPath + '/views');
	app.set('view engine', 'jade');
	app.engine('jade', require('jade').__express);

	app.use(express.static(config.rootPath + '/public'));
};