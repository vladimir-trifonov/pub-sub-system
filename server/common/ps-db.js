'use strict';

var Q = require('q');

function PsDb(kvDb, nosqlDb) {
	this.kvDb = kvDb;
	this.nosqlDb = nosqlDb;
}

PsDb.prototype.saveMsg = function(k, v) {
	return Q.Promise(function(resolve, reject) {
		// this.kvDb.rpush([k + '-messages', v], function(err) {
		// 	err && reject(err);
		// 	err || resolve({
		// 		channel: k,
		// 		msg: v
		// 	});
		// });
		resolve();
	}.bind(this));
}

PsDb.prototype.subscrChannels = function(data) {
	return Q.Promise(function(resolve, reject) {
		resolve(data);
	}.bind(this));
}

function client(kvDb, nosqlDb) {
	return new PsDb(kvDb, nosqlDb);
}

module.exports.client = client;