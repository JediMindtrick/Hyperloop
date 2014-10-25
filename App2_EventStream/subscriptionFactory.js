var zmq = require('zmq');

var subFuncs = {
	'zmq': function(subscription){
		var outSocket = zmq.socket('push');
		var zmqLocation = 'tcp://' + subscription.host + ':' + subscription.port;
		console.log('connecting to ' + zmqLocation);
		outSocket.connect(zmqLocation);

		return function(topic,data){
//			console.log('pubbing data: ' + JSON.stringify(data));		
			outSocket.send(JSON.stringify(data));
		};		
	}	
};

/*
Subscription looks sorta like this
{
    streamName: config.testStreamName,
    protocol: 'zmq',
    host: config.blpServerZmqHost,
    port: config.blpServerZmqPort
}
*/
exports.getSubscription = function(subscription){
	if(subFuncs[subscription.protocol]){
		return subFuncs[subscription.protocol](subscription);
	}else{
		console.log('ERROR: unknown subscription protocol: ' + subscription.protocol);
		return function(){};
	}
};