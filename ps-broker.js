/***																											*
 *** Publish-Subscribe based Broker - using Ps library		*
 *** ---------------------------------------------------- *
 *** This module is the central server which accepts			*
 *** connections from clients and publishers							*
 *** Usage: > node ps-broker <port>												*
 ***																											*/
'use strict';

var port = process.argv[2],
	redis = require('redis'),
	debug = require('debug')('ps-broker'),
	client = redis.createClient(),
	Q = require('q'),
	MongoClient = require('mongodb').MongoClient,
	// Connection URL
	url = 'mongodb://localhost:27017/ps';

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: port,
		path: '/websocket'
	});

// Starts the broker
var initPubSub = function(mongo) {
	var ps = require('./ps/ps'),
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

// Connect mongoDb client
var initMongo = function() {
	return Q.Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			var collection = db.collection('broker');

			err && reject(err);
			err || resolve(collection);
		});
	});
}

/**
 ** Start Broker
 ** Init mongoDb connection and starts the central websocket server
 **/
var initBroker = function() {
	initMongo()
		.then(initPubSub);
}
initBroker();