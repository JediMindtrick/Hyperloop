var uuid = require('node-uuid');

var now = function(){
	return (new Date()).getTime();
};

//THESE ALL SEND STATS TO REPORTING STREAM
//all.report
var createHeadOfStream = function(report){
	
};

var reportRunSet = function(set){

};

var reportPerfRunResults = function(all){

};

//GATHER STATISTICS AND ANALYSIS
var generateReport = function(report,dataset){
	var toReturn = report;

	//gather some stats over dataset

	return toReturn;
};

var statData = function(data){
	var toReturn = data;

	return data;
};

/*
To make reusable we also need
where to save
statData function
generateReport function
*/
exports.create = function(data){

	var obj = {
		finished: false
	};

	var currentSet = {
		report: {},
		data: []
	};

	var all = {
		report: {
			startTime: now(),
			endTime: null,
			received: 1,
			runId: uuid.v4(),
			max: data._metadata.runSize
		},
		sets: [],
		data: []
	};

	createHeadOfStream(all.report);

    var checkEnd = function(data){
    	//this is the end
    	if((report.max && received >= report.max)
    		|| data._metadata.endPerfRun){
    		all.report.endTime = now();
			obj.finished = true;
    		closeCurrentSet();
			all.report = generateReport(all.report,all.data);
			reportPerfRunResults(all);
    	}
    };

    var closeCurrentSet = function(){
		currentSet.report.endTime = now();
    	all.data.concat(currentSet.data);
    	currentSet.report = generateReport(currentSet.report,currentSet.data);
		reportRunSet(currentSet);
    };

	var openCurrentSet = function(){

		currentSet = {
			report: {
				startTime: now(),
				endTime: null,
				setId: uuid.v4()
			},
			data: []
		};

		all.sets.push(currentSet.report.setId);
	};

    var _perf = function(data){

		var toAdd = statData(data);

    	currentSet.push(toAdd);
	    received++;

	    if(received === 1){
	    	openCurrentSet();
	    }

	    if(received % 100 === 0){
	        console.log(received);
	        closeCurrentSet();
	        openCurrentSet();
	    }

	    checkEnd(data);
    };

	return obj;
};
