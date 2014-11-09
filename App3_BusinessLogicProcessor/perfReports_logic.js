var _ = require('lodash');

console.log('perf reports logic loaded');

//perfrunstart
//perfsetstart
//perfsetend
//perfrunend
var model = [];

var handlePerfRunStart = function(evt){
	console.log('handling start');
	var toReturn = {
		path: '/PerfRuns/' + evt.report.runId,
		data: evt
	};
	console.log('returning' + JSON.stringify(toReturn));
	return toReturn;
};

var onNew = function(_newEvents){
	var toReturn = [];

	_.forEach(_newEvents,function(evt){
		console.log(evt._metadata.eventType);
		//model = evt;
		if(evt._metadata.eventType.toLowerCase() === 'perfrunstart'){
			toReturn.push(handlePerfRunStart(evt));
		}
//		toReturn.push({path: '/PerfRuns', data: evt});
	});

/*
	return [
		{ path: '/PerfRuns', data: model }
	];
	*/

	return toReturn;
};

exports.logic = onNew;