var http = require('../simpleHttp'),
config = require('../config'),
zmq = require('zmq'),
_ = require('lodash'),
argv = require('yargs').argv,
logic = (argv.logic ? require('./' + argv.logic).logic : require('./sampleLogic').logic),
modelRoot = (argv.modelRoot ? argv.modelRoot : '/Store/TestOrg');

//Stuff going out
var storeSocket = zmq.socket('push');
var zmqStoreLocation = 'tcp://' + config.realTimeStoreZmqHost + ':' + config.realTimeStoreZmqPort;
storeSocket.connect(zmqStoreLocation);
console.log('bound to store at ' + zmqStoreLocation);

//Stuff coming in
var blpSubscriberSocket = zmq.socket('pull');
var zmqBlpLocation = 'tcp://' + config.blpServerZmqHost + ':' + config.blpServerZmqPort;
blpSubscriberSocket.bindSync(zmqBlpLocation);
console.log('listening for stream updates at ' + zmqBlpLocation);

var onNew = function(msg){

	var val = JSON.parse(msg);

	var _publishReceived = (new Date()).getTime();
	_.forEach(val,function(evt){
		evt._metadata = evt._metadata ? evt._metadata : {};
		evt._metadata.perfPublishReceived = _publishReceived;
	});

	var updates = logic(val,modelRoot);

	if(updates){
		_.forEach(updates,function(update){
			//tell it where to go...
			if(update.path.indexOf(modelRoot) < 0){
				update.path = modelRoot + update.path;
			}

			update.data._metadata = update.data._metadata ? update.data._metadata : {};
			update.data._metadata.perfSendToStore = (new Date()).getTime();
			storeSocket.send(JSON.stringify(update));
		});
	}
};


//'message' is the zmq event, our preferred semantics would be 'POST'
blpSubscriberSocket.on('message', onNew);

var client = http.create(config.eventServerHttpHost, config.eventServerHttpPort, 3);

client.post('/SubscribeStream',{
	streamName: config.testStreamName,
	protocol: 'zmq',
	host: config.blpServerZmqHost,
	port: config.blpServerZmqPort
});