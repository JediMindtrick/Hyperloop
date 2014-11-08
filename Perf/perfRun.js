var uuid = require('node-uuid'),
_ = require('lodash')
analysis = require('./analysis');

var client = null;

var now = function(){
	return (new Date()).getTime();
};

//THESE ALL SEND STATS TO REPORTING STREAM
//all.report
var createHeadOfStream = function(report){
	//perf run start event
	report._metadata = report._metadata || {};
	report._metadata.eventType = "PerfRunStart";

	console.log('perf run begin');

	if(client && client.send){
		client.send(report);
	}
};

var reportOpenRunSet = function(set){
	//run set opened event
	set._metadata = set._metadata || {};
	set._metadata.eventType = "PerfSetStart";

	console.log('run set begin');

	if(client && client.send){
		client.send(set);
	}
};

var reportRunSet = function(set){
	//run set closed event
	set._metadata = set._metadata || {};
	set._metadata.eventType = "PerfSetEnd";

	console.log('run set end');

	if(client && client.send){
		client.send(set);
	}else{
		console.log(JSON.stringify(set._metadata));
		console.log(JSON.stringify(set.report));	
	}	
};

var reportPerfRunResults = function(all){
	//perf run finished event
	all._metadata = all._metadata || {};
	all._metadata.eventType = "PerfRunEnd";

	console.log('perf run end');

	if(client && client.send){
		client.send(all);
	}else{
		console.log(JSON.stringify(all.report));	
	}	
};

//GATHER STATISTICS AND ANALYSIS
var generateReport = function(report,dataset){
	return analysis.generateReport(report,dataset);
};

var statData = function(data){
	return analysis.statData(data);
};

exports.create = function(data,reportStream){

	client = reportStream || null;

	var obj = {
		finished: false
	};

	var currentSet = {		
		report: {},
		data: []
	};

	var all = {
		_metadata:{},
		report: {
			startTime: now(),
			endTime: null,
			received: 0,
			runId: uuid.v4(),
			max: data._metadata.runSize
		},
		sets: [],
		data: []
	};

	createHeadOfStream(all);

    var checkEnd = function(data){
    	//this is the end
    	if((all.report.max && all.report.received >= all.report.max)
    		|| _.any(data,function(d){ return d._metadata.endPerfRun && d._metadata.endPerfRun === true; })){
    		all.report.endTime = now();
			obj.finished = true;
    		closeCurrentSet();
			all.report = generateReport(all.report,all.data);
			reportPerfRunResults(all);
    	}
    };

    var closeCurrentSet = function(){
		currentSet.report.endTime = now();
    	all.data = all.data.concat(currentSet.data);
    	currentSet.report = generateReport(currentSet.report,currentSet.data);
		reportRunSet(currentSet);
    };

	var openCurrentSet = function(){

		currentSet = {
			_metadata:{},
			report: {
				startTime: now(),
				endTime: null,
				setId: uuid.v4()
			},
			data: []
		};

		all.sets.push(currentSet.report.setId);

		currentSet.report.setNumber = all.sets.length;
		reportOpenRunSet(currentSet);
	};

    var _perf = function(data){
    	var _data = data;
    	if(!_.isArray(data)){
    		_data = [data];
    	}

    	all.report.received = all.report.received + _data.length;

	    if(all.report.received === 1){

	    	openCurrentSet();
	    }

		var toAdd = statData(_data);

		currentSet.data = currentSet.data.concat(toAdd);

	    if(all.report.received % 100 === 0){
	        console.log(all.report.received);
	        closeCurrentSet();
	        openCurrentSet();
	    }

	    checkEnd(_data);
    };

    obj.perf = _perf;

	return obj;
};
