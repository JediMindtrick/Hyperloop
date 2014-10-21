var config = require('./config'),
Q = require('q'),
_ = require('lodash');


var _create = function(s){

	var stream = s;

	var notifyStreamSubscribers = function(evt){
		console.log('notifying subscribers of: ' + JSON.stringify(evt));
	};

	var _oldPush = s.push;

	s.push = function(evt){
		var deferred = Q.defer();

		_oldPush(evt)
		.then(function(_newEvt){
			notifyStreamSubscribers(_newEvt);
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