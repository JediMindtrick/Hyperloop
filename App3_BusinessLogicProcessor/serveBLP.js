var http = require('../simpleHttp'),
config = require('../config'),
zmq = require('zmq'),
logic = require('./sampleLogic').logic,
_ = require('lodash');

//Stuff going out
var storeSocket = zmq.socket('push');
var zmqStoreLocation = 'tcp://' + config.realTimeStoreZmqHost + ':' + config.realTimeStoreZmqPort;
storeSocket.connect(zmqStoreLocation);
console.log('bound to store at ' + zmqStoreLocation);
var pushToModel = function(msg){
    storeSocket.send(JSON.stringify({path:'/Store/TestOrg/current/0',data: msg}));
};

//Stuff coming in
var blpSubscriberSocket = zmq.socket('pull');
var zmqBlpLocation = 'tcp://' + config.blpServerZmqHost + ':' + config.blpServerZmqPort;
blpSubscriberSocket.bindSync(zmqBlpLocation);
console.log('listening for stream updates at ' + zmqBlpLocation);
var onNew = function(msg){
	var val = JSON.parse(msg);
//	console.log('received new event: ' + msg);
	var updates = logic(val);
	if(updates){
		_.forEach(updates,function(update){
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