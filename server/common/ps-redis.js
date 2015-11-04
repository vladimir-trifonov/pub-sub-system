'use strict';

var Q = require('q');

function PsRedis(client) {
	this.client = client;
}

PsRedis.prototype.saveMsg = function(k, v) {
	return Q.Promise(function(resolve, reject) {
		// this.client.rpush([k + '-messages', v], function(err) {
		// 	err && reject(err);
		// 	err || resolve({
		// 		channel: k,
		// 		msg: v
		// 	});
		// });
		resolve();
	}.bind(this));
}

PsRedis.prototype.subscrChannels = function(data) {
	return Q.Promise(function(resolve, reject) {
		resolve(data);
	}.bind(this));
}

function client(client) {
	return new PsRedis(client);
}

module.exports.client = client;