var _ = require('lodash');

var getRange = function(arr,start,end){
    //examples 1-100, 101-200
    return _.take(_.rest(arr,start-1),(end - start + 1));
};

var getRangePartitions = function(len,by){
    var toReturn = [];
    var ends = [];
    var currStart = 1;

    while(currStart < len){
        var dataset = {
            begin: currStart,
            end: currStart + (by - 1)
        };

        if(dataset.end > len) dataset.end = len;

        currStart = dataset.end + 1;

        toReturn.push(dataset);
    }

    return toReturn;
};

var getAverage = function(arr,selector){
    var avgAcc = _.reduce(arr,
        function(acc,point){
            acc.count++;
            acc.sum += selector(point);
            return acc;
        },{count: 0, sum: 0});

    var average = avgAcc.sum / avgAcc.count;
    return average;
};

var getSet = function(arr){
    var toReturn = [];

    var partitions = getRangePartitions(arr.length,100);

    toReturn = _.map(partitions,function(part,idx){

        var dataset = getRange(arr,part.begin,part.end);

        return {
            partition: idx,
            sendToStream: getAverage(dataset,function(d){ return d.SendToStream }),
            between1: getAverage(dataset,function(d){ return d.Between1 }),
            writeToDisk: getAverage(dataset,function(d){ return d.WriteToDisk }),
            between2: getAverage(dataset,function(d){ return d.Between2 }),
            sendToBLP: getAverage(dataset,function(d){ return d.SendToBLP }),
            blpLogic: getAverage(dataset,function(d){ return d.BLPlogic }),
            sendToStore: getAverage(dataset,function(d){ return d.SendToStore }),
            setModel: getAverage(dataset,function(d){ return d.SetModel }),
            sendToClient: getAverage(dataset,function(d){ return d.SendToClient }),
            totalTime: getAverage(dataset,function(d){ return d.TotalTime; })
        };
    });

    return toReturn;
};

var getDataPoints = function(arr){
    return _.map(arr,function(e){

        var evt = e._metadata;

        evt.TotalTime = evt.perfClientReceived - evt.perfClientSent;
        evt.SendToStream = evt.perfStreamReceived - evt.perfClientSent;
        evt.Between1 = evt.perfBeginCommit - evt.perfStreamReceived;
        evt.WriteToDisk = evt.perfEndCommit - evt.perfBeginCommit;
        evt.Between2 = evt.perfPublishEvent - evt.perfEndCommit;
        evt.SendToBLP = evt.perfPublishReceived - evt.perfPublishEvent;
        evt.BLPlogic = evt.perfSendToStore - evt.perfPublishReceived;
        evt.SendToStore = evt.perfStoreReceived - evt.perfSendToStore;
        evt.SetModel = evt.perfNotifyModelChange - evt.perfStoreReceived;
        evt.SendToClient = evt.perfClientReceived - evt.perfNotifyModelChange;

        return evt;
    });
};


//GATHER STATISTICS AND ANALYSIS
var _generateReport = function(report,dataset){

    report.sendToStream = getAverage(dataset,function(d){ return d.SendToStream });
    report.between1 = getAverage(dataset,function(d){ return d.Between1 });
    report.writeToDisk = getAverage(dataset,function(d){ return d.WriteToDisk });
    report.between2 = getAverage(dataset,function(d){ return d.Between2 });
    report.sendToBLP = getAverage(dataset,function(d){ return d.SendToBLP });
    report.blpLogic = getAverage(dataset,function(d){ return d.BLPlogic });
    report.sendToStore = getAverage(dataset,function(d){ return d.SendToStore });
    report.setModel = getAverage(dataset,function(d){ return d.SetModel });
    report.sendToClient = getAverage(dataset,function(d){ return d.SendToClient });
    report.totalTime = getAverage(dataset,function(d){ return d.TotalTime; });

    var t1 = report.endTime;
    var t2 = report.startTime;
    var diff = (_.isDate(t1) ? t1.getTime() : t1) - (_.isDate(t2) ? t2.getTime() : t2);
    var Seconds_from_T1_to_T2 = diff / 1000;
    var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);

    report.elapsedSec = Seconds_from_T1_to_T2;
    report.totalRecords = dataset.length;
    report.recordsPerSec = (dataset.length / Seconds_from_T1_to_T2);

    return report;
};

exports.statData = function(data){
    return getDataPoints(data);  
};
exports.generateReport = _generateReport;