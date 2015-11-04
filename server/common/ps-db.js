'use strict';

var Q = require('q'),
	async = require('async'),
	moment = require('moment'),
	_ = require('lodash');

function PsDb(kvDb, nosqlDb) {
	this.kvDb = kvDb;
	this.nosqlDb = nosqlDb;
}

PsDb.prototype.saveMsg = function(channel, msg) {
	return insertDoc.call(this, {
		channel: channel,
		msg: msg,
		updated: moment().toDate()
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

PsDb.prototype.getChSubs = function(channel) {
	return Q.Promise(function(resolve, reject) {
		this.kvDb.lrange(channel, 0, -1, function(err, reply) {
			err && reject(err);
			err || resolve(reply);
		});
	}.bind(this));
}

PsDb.prototype.getLastMsgs = function(channels) {
	return Q.Promise(function(resolve, reject) {
		var filterDate = moment().subtract(30, 'minutes').toDate();

		this.nosqlDb.find({
			$and: [{
				channel: {
					$in: channels
				}
			}, {
				updated: {
					$gte: filterDate
				}
			}]
		}).toArray(function(err, data) {
			if (err) {
				return reject(err);
			}

			err || resolve(groupAndConcatMsgsByChs(data));
		});
	}.bind(this));
}

var groupAndConcatMsgsByChs = function(data) {
	return _.chain(data)
		.groupBy('channel')
		.map(function(chInfo, ch) {
			var mapped = {};
			mapped[ch] = _.pluck(chInfo, 'msg');

			return mapped;
		})
		.reduce(function(result, n) {
			var key = Object.keys(n)[0];
			result[key] = n[key];

			return result;
		}, {})
		.value()
}

var insertDoc = function(doc) {
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