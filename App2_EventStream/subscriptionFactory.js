var zmq = require('zmq'),
_ = require('lodash');

var subFuncs = {
	'zmq': function(subscription){
		var outSocket = zmq.socket('push');
		var zmqLocation = 'tcp://' + subscription.host + ':' + subscription.port;
		console.log('connecting to ' + zmqLocation);
		outSocket.connect(zmqLocation);

		return function(topic,data){	
			var _publishEvent = (new Date()).getTime();
			_.forEach(data,function(evt){
				evt._metadata.perfPublishEvent = _publishEvent;
			});

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