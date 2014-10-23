var http = require('../simpleHttp'),
config = require('../config'),
zmq = require('zmq');

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
var onUpdate = function(msg){
	var val = JSON.parse(msg);
	console.log(msg);
};
blpSubscriberSocket.on('POST', onUpdate);

var client = http.create(config.eventServerHttpHost, config.eventServerHttpPort);
client.post('/Subscribe',{
	streamName: config.testStreamName,
	protocol: 'zmq',
	host: config.blpServerZmqHost,
	port: config.blpServerZmqPort
});