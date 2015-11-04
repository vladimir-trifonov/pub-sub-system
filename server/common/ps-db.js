'use strict';

var Q = require('q'),
	async = require('async'),
	_ = require('lodash');

function PsDb(kvDb, nosqlDb) {
	this.kvDb = kvDb;
	this.nosqlDb = nosqlDb;
}

PsDb.prototype.saveMsg = function(channel, msg) {
	return saveDoc.call(this, {
			channel: channel,
			msg: msg,
			updated: new Date()
		});
}

PsDb.prototype.chsSub = function(id, channels) {
	return Q.Promise(function(resolve, reject) {
		async.each(channels, pushValueByKey(id).bind(this), function(err) {
			err && reject(err);
			err || resolve();
		});
	}.bind(this));
}

var saveDoc = function(doc) {
	return Q.Promise(function(resolve, reject) {
		this.nosqlDb.insert(doc, function(err) {
			err && reject(err);
			err || resolve();
		});
	}.bind(this));
}

var pushValueByKey = _.curry(function(v, k) {
	return Q.Promise(function(resolve, reject) {
		this.kvDb.rpush([k, v], function(err) {
			err && reject(err);
			err || resolve();
		});
	}.bind(this));
});

function client(kvDb, nosqlDb) {
	return new PsDb(kvDb, nosqlDb);
}

module.exports.client = client;