var uuid = require('node-uuid');

var now = function(){
	return (new Date()).getTime();
};

//all.report
var createHeadOfStream = function(report){

};

var reportRunSet = function(set){
	
};

var reportPerfRunResults = function(all){

};

exports.create = function(data){

	var currentSet = {
		report: {}
		data: []
	};

	var all = {
		report: { 
			startTime: now(),
			endTime: null
			received: 1,
			runId: uuid.v4(),
			max: data._metadata.runSize
		},
		dataPoints: []
	};

	//create head of stream

	var generateReport = function(report,dataset){
		var toReturn = report;

		//gather some stats over dataset

		return toReturn;
	};

    var checkEnd = function(data){
    	//this is the end
    	if((report.max && received >= report.max)
    		|| data._metadata.endPerfRun){
    		report.endTime = now();
    		closeCurrentSet();
    		//getAllStats();
    		//saveAllStats();
    		//saveReport();
    	}

    };

    var closeCurrentSet = function(){
    	dataPoints.concat(currentSet.data);	
    	generateReport
    };

    var _perf = function(data){

    	currentSet.push(data);
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


	return {
		finished: false		
	};	
};