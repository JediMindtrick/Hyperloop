var ds = require('./durableEventStream.js')
uuid = require('node-uuid'),
_ = require('lodash'),
ss = require('./subscribableEventStream.js');

var es = null;

var handleGet = function(promise){
	promise
	.then(function(res){
		console.log('value');
	  	console.log(res);
	})
	.fail(function(err){
	  	console.log('error');
	  	console.log(err);
	});
};

var run = function(){

	es.push([{type: 'foo'},{type: 'bar'}])
	.then(function(res){
		console.log(JSON.stringify(res));

		var sId = es.name();

		_.forEach(res,function(e){

			handleGet(es.get(sId + ':' + e._metadata.streamOrder))
			handleGet(es.get(sId + ':' + e._metadata.eventId));
		});

		handleGet(es.get(sId + ':top'));

	})
	.fail(function(err){
		console.log(err);
	});

};


ds.create('test:' + uuid.v4())
.then(function(obj){

	ss.create(obj)
	.then(function(obj2){

		es = obj2;
		run();

	})
	.fail(function(err){
		console.log(err);		
	});


})
.fail(function(err){
	console.log(err);
});