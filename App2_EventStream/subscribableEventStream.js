var Q = require('q'),
_ = require('lodash'),
pubsub = require('pubsub-js');


var _create = function(s){

	var stream = s;

	var notifyNewEvent = function(evt){
//		console.log('notifying subscribers of: ' + JSON.stringify(evt));
		pubsub.publish('POST',evt);
	};

	var _oldPush = s.push;

	s.subscribe = function(topic,handler){
		return pubsub.subscribe(topic,handler);
	};

	s.push = function(evt){
		var deferred = Q.defer();

		_oldPush(evt)
		.then(function(_newEvt){
			notifyNewEvent(_newEvt);
			deferred.resolve(_newEvt);
		})
		.fail(function(err){
			console.log('subscribers were not notified of nuthin\'!');
			deferred.reject(err);
		})

		return deferred.promise;
	};

	var returnPromise = Q.defer();

	returnPromise.resolve(s);

	return returnPromise.promise;

};

exports.create = _create;