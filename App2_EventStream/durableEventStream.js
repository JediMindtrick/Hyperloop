var config = require('../config'),
uuid = require('node-uuid'),
Q = require('q'),
_ = require('lodash'),
levelup = require('level'),
retry = require('../functions').retryPromise;

var create = function(name){

	//or load from leveldb
	var _order = -1,
	streamId = null,
	db = null,
	maxTries = 3;

	var _push = function(_evt){

		var deferred = Q.defer();

		var evts = _.isArray(_evt) ? _evt : [_evt];

		var _beginCommit = (new Date()).getTime();

		var batch = db.batch();

		var savedEvents = _.map(evts,function(evt){
			
			if(evt._metadata === undefined || evt._metadata === null) evt._metadata = {};

			evt._metadata.perfBeginCommit = _beginCommit;
			
			//add order and id metadata
			_order = _order + 1;
			evt._metadata.streamOrder = _order;
			evt._metadata.eventId = uuid.v4();
			evt._metadata.streamId = streamId;

			batch.put(streamId + ':' + evt._metadata.streamOrder, JSON.stringify(evt));
			batch.put(streamId + ':' + evt._metadata.eventId, JSON.stringify(evt));

			return evt;
		});

		batch.write(function(err){
			if(err){
				deferred.reject(err);
			}
		});

		//key,value,options,callback
		//we want to guarantee everything got saved
		db.put(streamId + ':top',_order,{sync: true},function(err){
			if(err){
				deferred.reject('Unable to commit batch write: ' + err);
			}else{
				var _endCommit = (new Date()).getTime();
				_.forEach(savedEvents,function(evt){
					evt._metadata.perfEndCommit = _endCommit;
				});

				deferred.resolve(savedEvents);
			}
		});

		return deferred.promise
	};

	var _setName = function(name){
		var toReturn = Q.defer();

		if(streamId) throw 'Attempts to change stream name not allowed.';
		streamId = name;

		var _tempDb = levelup(config.eventServerStoreContainer + '/' + streamId);

		_tempDb.get(name + ':top',function(err,val){
			if(err && err.notFound){
				console.log('top of stream "' + streamId + '" is -1');
				_order = -1;
				db = _tempDb;
				toReturn.resolve(streamId);
			}else if (err){
				throw err;
				toReturn.reject(err);
			}else{
				console.log('top of stream "' + streamId + '" is ' + val);
				_order = parseInt(val);
				db = _tempDb;
				toReturn.resolve(streamId);
			}
			
		});

		return toReturn.promise;
	};

	var obj = {};

	obj.push = function(evt){
		return retry(
			function(){
				return _push(evt);
			},
			3);
	};

	obj.get = function(key){

		var toReturn = Q.defer();

		db.get(key,function(err,val){
			if(err){
				toReturn.reject(err);
			}else{
				toReturn.resolve(val);
			}
		});

		return toReturn.promise;
	};

	obj.name = function(val){
		if(val){
			_setName(val);
			return val;
		}

		return streamId;
	};


	//creation and initialization wrapped in deferred
	var returnPromise = Q.defer();

	_setName(name)
	.then(function(){
		returnPromise.resolve(obj);
	})
	.fail(function(err){
		returnPromise.reject('unable to create stream: ' + err);
	});


	return returnPromise.promise;

};

exports.create = create;