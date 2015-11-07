/***																											*
 *** Ps library module - Uses databases    								*
 *** for storing pub-sub modules related data							*
 ***																											*/
'use strict';

var Q = require('q'),
	moment = require('moment'),
	_ = require('lodash');

/*
 * Ps-db base class
 */
function PsDb(kvDb, nosqlDb) {
	this.kvDb = kvDb;
	this.nosqlDb = nosqlDb;
}

// Save new messages
PsDb.prototype.saveMsg = function(channel, msg) {
	return insertDoc.call(this, {
		channel: channel,
		msg: msg,
		updated: moment().toDate()
	});
}

// Subscribe client for channels' updates
PsDb.prototype.chsSub = function(id, channels) {
	_.each(channels, chSub(id).bind(this));
	this.kvDb.rpush([id + '-usr'].concat(channels));
}

// Unubscribe client for channels' updates
PsDb.prototype.chsUnsub = function(id) {
	this.kvDb.lrange(id + '-usr', 0, -1, function(err, channels) {
		_.each(channels, chUnsub(id).bind(this));
		this.kvDb.del(id + '-usr');
	}.bind(this));
}

var chSub = _.curry(function(v, k) {
	if (_.isString(k) && k !== '') {
		this.kvDb.rpush([k + '-ch', v]);
	}
});

var chUnsub = _.curry(function(v, k) {
	if (_.isString(k) && k !== '') {
		this.kvDb.lrem(k + '-ch', 0, v);
	}
});

// Get clients subscribed for specific channel updates
PsDb.prototype.getChSubs = function(channel) {
	return Q.Promise(function(resolve, reject) {
		if (_.isString(channel) && channel !== '') {
			this.kvDb.lrange(channel + '-ch', 0, -1, function(err, reply) {
				err && reject(err);
				err || resolve(reply);
			});
		} else {
			resolve([]);
		}

	}.bind(this));
}

// Get last messages stored for specific channel
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

/**
 ** Ps-ws used methods
 **/

// Transfor mongoDb data to the following format:
// {<channel_name>: [messages], <channel_name>: [messages], ...}
var groupAndConcatMsgsByChs = function(data) {
	return _
		.chain(data)
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

// Save new doc to mongoDb
var insertDoc = function(doc) {
	return Q.Promise(function(resolve, reject) {
		this.nosqlDb.insert(doc, function(err) {
			err && reject(err);
			err || resolve();
		});
	}.bind(this));
}

/*
 * Dependency injection and classes exports
 */
function client(kvDb, nosqlDb) {
	return new PsDb(kvDb, nosqlDb);
}

module.exports.client = client;