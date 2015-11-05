/**
 * Ps system web server
 */

'use strict';

var express = require('express'),
    app = express(),
    env = process.env.NODE_ENV || 'development',
    config = require('./server/configs/config')[env];

require('./server/configs/express')(app, config);
require('./server/configs/routes')(app);

app.listen(config.port);
console.log('Starting server on port: ' + config.port);