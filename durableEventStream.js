var config = require('./config'),
uuid = require('node-uuid'),
Q = require('q'),
_ = require('lodash'),
levelup = require('level');

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
		
		if(evt._meta === undefined || evt._meta === null) evt._meta = {};
		
		//add order and id metadata
		_order++;
		evt._meta.streamOrder = _order;
		evt._meta.eventId = uuid.v4();
		evt._meta.streamId = streamId;

		batch.put(streamId + ':' + evt._meta.streamOrder, JSON.stringify(evt));
		batch.put(streamId + ':' + evt._meta.eventId, JSON.stringify(evt));

		return evt._meta;
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

exports.push = function(evt){
	return retry(
		function(){
			return _push(evt);
		},
		3);
};

exports.get = function(key){

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

var _setName = function(name){
	if(streamId) throw 'Attempts to change stream name not allowed.';
	streamId = name;
	db = levelup(config.levelDbContainer + '/' + streamId);
};

exports.name = function(val){
	if(val){
		_setName(val);
		return val;
	}

	return streamId;
};