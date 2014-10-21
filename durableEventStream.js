var config = require('./config'),
uuid = require('node-uuid'),
Q = require('q'),
_ = require('lodash'),
levelup = require('level');

//TODO: factor this out into utility library
var retry = function(func,maxTries,deferred,tries,originalErrors){
	var toReturn = deferred ? deferred : Q.defer();

	//null case 1
	var numTries = tries ? tries + 1 : 1;
	if(numTries > maxTries){
		toReturn.reject(originalErrors);
		return;
	} 

	func()
	//null case 2
	.then(function(result){
		toReturn.resolve(result);
	})
	//recursion
	.fail(function(err){
		retry(func,maxTries,toReturn,numTries,err);
	});

	return toReturn.promise;
};

var create = function(name){

	//or load from leveldb
	var _order = -1,
	streamId = null,
	db = null,
	maxTries = 3;

	var _push = function(_evt){

		var deferred = Q.defer();

		var evts = _.isArray(_evt) ? _evt : [_evt];


		var batch = db.batch();

		var writeIds = _.map(evts,function(evt){
			
			if(evt._metadata === undefined || evt._metadata === null) evt._metadata = {};
			
			//add order and id metadata
			_order++;
			evt._metadata.streamOrder = _order;
			evt._metadata.eventId = uuid.v4();
			evt._metadata.streamId = streamId;

			batch.put(streamId + ':' + evt._metadata.streamOrder, JSON.stringify(evt));
			batch.put(streamId + ':' + evt._metadata.eventId, JSON.stringify(evt));

			return evt._metadata;
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
				deferred.resolve(writeIds);
			}
		});

		return deferred.promise
	};

	var _setName = function(name){
		var toReturn = Q.defer();

		if(streamId) throw 'Attempts to change stream name not allowed.';
		streamId = name;

		var _tempDb = levelup(config.levelDbContainer + '/' + streamId);

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