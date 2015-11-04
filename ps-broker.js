'use strict';

var port = process.argv[2] || 3001,
	redis = require('redis'),
	debug = require('debug')('ps-broker'),
	client = redis.createClient(),
	_ = require('lodash'),
	Q = require('q'),
	MongoClient = require('mongodb').MongoClient,
	// Connection URL
	url = 'mongodb://localhost:27017/ps-broker';

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: port
	});

var initPubSub = function(mongo) {
	var ps = require('./server/common/ps'),
		broker = ps.broker({
			socket: wss,
			redis: client,
			mongo: mongo
		});

	var onerror = function(err) {
		debug('Error: ', err);
	}

	broker.on('data', debug);
	broker.on('error', onerror);
}

var initMongo = function() {
	return Q.Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			err && reject(err);
			err || resolve(db);
		});
	});
}

var initBroker = _.flowRight(initPubSub, initMongo);
initBroker();