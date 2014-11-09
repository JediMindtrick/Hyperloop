var _ = require('lodash');

console.log('perf reports logic loaded');

//perfrunstart
//perfsetstart
//perfsetend
//perfrunend
/*
var store = { 
    TestOrg: { 
        PerfRuns: { 
            List: { },
            Completed: { }
        },
        Sets: {
            List:{ },
            Completed: { }
        }
    } 
};
*/

var handlePerfRunStart = function(evt){
	console.log('handling run start');
	var toReturn = {
		path: '/PerfRuns/List/' + evt.report.runId,
		data: evt
	};
	return toReturn;
};

var handlePerfSetStart = function(evt){
	console.log('handling set start');
	var toReturn = {
		path: '/PerfSets/List/' + evt.report.setId,
		data: evt
	};
	return toReturn;
};

var handlePerfSetEnd = function(evt){
	console.log('handling set end');
	var toReturn = {
		path: '/PerfSets/Completed/' + evt.report.setId,
		data: evt
	};
	return toReturn;
};

var handlePerfRunEnd = function(evt){
	console.log('handling run end');
	var toReturn = {
		path: '/PerfRuns/Completed/' + evt.report.runId,
		data: evt
	};
	return toReturn;
};

var onNew = function(_newEvents){
	var toReturn = [];

	_.forEach(_newEvents,function(evt){
		console.log(evt._metadata.eventType);
		if(evt._metadata.eventType.toLowerCase() === 'perfrunstart'){
			toReturn.push(handlePerfRunStart(evt));
		}
		if(evt._metadata.eventType.toLowerCase() === 'perfsetstart'){
			toReturn.push(handlePerfSetStart(evt));
		}
		if(evt._metadata.eventType.toLowerCase() === 'perfsetend'){
			toReturn.push(handlePerfSetEnd(evt));
		}
		if(evt._metadata.eventType.toLowerCase() === 'perfrunend'){
			toReturn.push(handlePerfRunEnd(evt));
		}
	});

	return toReturn;
};

exports.logic = onNew;