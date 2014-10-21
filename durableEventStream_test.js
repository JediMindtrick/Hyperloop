var es = require('./durableEventStream.js')
levelup = require('level'),
config = require('./config.js'),
uuid = require('node-uuid'),
_ = require('lodash');

es.name('test:' + uuid.v4());

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

es.push([{type: 'foo'},{type: 'bar'}])
.then(function(res){
	console.log(JSON.stringify(res));

	var sId = es.name();

	_.forEach(res,function(e){

		handleGet(es.get(sId + ':' + e.streamOrder))
		handleGet(es.get(sId + ':' + e.eventId));
	});

	handleGet(es.get(sId + ':top'));

})
.fail(function(err){
	console.log(err);
});