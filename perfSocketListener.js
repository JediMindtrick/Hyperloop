var http = require('http');
var config = require('./config.js');

var singlePerfLimit = 10000;
var maxPerf = singlePerfLimit;
var perfReceived = -2;
var singlePerfStart = new Date();
var ended = false;

var checkEnd = function(){
    if(perfReceived >= maxPerf && !ended){
        var _now = new Date();
        console.log('end perf ' + _now);

        var t1 = _now;
        var t2 = singlePerfStart;
        var dif = t1.getTime() - t2.getTime()

        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        console.log('It took ' + Seconds_from_T1_to_T2 + ' seconds to process ' + singlePerfLimit + ' records');
        console.log('that is ' + (singlePerfLimit / Seconds_from_T1_to_T2) + ' records/sec');
        ended = true;
        socket.disconnect();
    }
};

var onSinglePerf = function(snapshot){
    perfReceived++;
//    console.log('perfReceieved = ' + perfReceived);
    if(perfReceived === 1){
        singlePerfStart = new Date();
        console.log('starting perf at ' + singlePerfStart);
    }

    if(perfReceived % 100 === 0){
        console.log(perfReceived);
    }

    checkEnd();
};

var io = require('./node_modules/socket.io/node_modules/socket.io-client');
var _base = 'http://' + config.realTimeStoreHost + ':' + config.realTimeStorePort; 

var onValue = function(data){};
var socket = null;
var getRef = function(path){
    var root = io(_base);

    root.on('subscribed',function(path){
        console.log('server ack ' + path);
        socket = io(_base + path);

        socket.on('value',function(data){
            onSinglePerf(null);
        });
    });

    root.on('connect',function(){
        console.log('subscribing to /TestOrg');
        root.emit('subscribe','/TestOrg/current');
    });
};

getRef();
