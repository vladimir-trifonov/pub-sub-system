'use strict';

var Q = require('q');

function PsRedis(client) {
	this.client = client;
}

PsRedis.prototype.store = function(k, v) {
	return Q.Promise(function(resolve, reject) {
		this.client.rpush([k, v], function(err) {
			err && reject(err);
			err || resolve();
		})
	}.bind(this));
}

function client(client) {
	return new PsRedis(client);
}

module.exports.client = client;