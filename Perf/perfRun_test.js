var perfRun = require('./perfRun'),
uuid = require('node-uuid')
streamClient = require('../streamClient'),
config = require('../config');

var client = null;

var currentPerfRun = null;
var onPerf = function(data){
    if(data._metadata.startPerfRun && (!currentPerfRun || currentPerfRun.finished)){
        //create a new perf run
        currentPerfRun = perfRun.create(data,client);
    }

    if(currentPerfRun && !currentPerfRun.finished){
        currentPerfRun.perf(data);
    }
};

var _order = -1;
var newData = function(){
	_order++;
	var now = (new Date()).getTime();
    var _newEvt = {
    	_metadata: {
	        streamOrder: _order,
	        eventId: uuid.v4(),

	        perfClientSent: now,
	        perfStreamReceived: now + 1,
	        perfBeginCommit: now + 2,
	        perfEndCommit: now + 3,
	        perfPublishEvent: now + 4,
	        perfPublishReceived: now + 5,
	        perfSendToStore: now + 6,
	        perfStoreReceived: now + 7,
	        perfNotifyModelChange: now + 8,
	        perfClientReceived: now + 9
    	}
    };

    return _newEvt;
}


streamClient.create(config.perfEventsHost,config.perfEventsPort)
.then(function(_cl){
    client = _cl;

    var first = newData();
	first._metadata.startPerfRun = true;
	first._metadata.runSize = 10;
	onPerf(first);

	for(var i = 0, l = 1301; i < l; i++){
		onPerf(newData());
	}

	var last = newData();
	last._metadata.endPerfRun = true;
	onPerf(last);
});