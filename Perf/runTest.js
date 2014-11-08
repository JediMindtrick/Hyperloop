var perfRun = require('./perfRun'),
uuid = require('node-uuid')
streamClient = require('../streamClient'),
config = require('../config');

var client = null;

var onPerf = function(data){
	client.send(data);
};

var newData = function(){
	var now = (new Date()).getTime();
    var _newEvt = {
    	_metadata: {
    		perfClientSent: now
    	},
    	test: 'test'
    };

    return _newEvt;
}

//http://jedimindtrick8-6001.terminal.com/Store/TestOrg
streamClient.create('jedimindtrick8-4000.terminal.com',80)
.then(function(_cl){
    client = _cl;

    var first = newData();
	first._metadata.startPerfRun = true;
	first._metadata.runSize = 1000;
	onPerf(first);

	for(var i = 0, l = 1301; i < l; i++){
		onPerf(newData());
	}

	var last = newData();
	last._metadata.endPerfRun = true;
	onPerf(last);
});