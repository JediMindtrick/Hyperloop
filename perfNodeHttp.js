var http = require('http'),
config = require('./config.js'),
uuid = require('node-uuid'),
streamClient = require('./streamClient');

var singlePerfLimit = 10000;
var maxPerf = singlePerfLimit;
var perfReceived = -10;//don't count the first ten towards the test
var singlePerfStart = new Date();
var ended = false;
var dataPoints = [];
var _end = new Date();

var saveDataPoints = function() {

    //write it to the perf events stream
    var testRun = {
        name: uuid.v4(),
        startTime: singlePerfStart,
        endTime: _end,
        data: dataPoints
    };

    streamClient.create(config.perfEventsHost,config.perfEventsPort)
        .then(function(_cl){
            _cl.send(testRun);
            setTimeout(function(){
                process.exit();
            },3000);
        });
};

var checkEnd = function(){
    if(perfReceived >= perfMax && !ended){
        _end = new Date();
        console.log('end perf ' + _end);

        var t1 = _end;
        var t2 = singlePerfStart;
        var dif = t1.getTime() - t2.getTime();

        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        console.log('It took ' + Seconds_from_T1_to_T2 + ' seconds to process ' + singlePerfLimit + ' records');
        console.log('that is ' + (singlePerfLimit / Seconds_from_T1_to_T2) + ' records/sec');
        ended = true;
        socket.disconnect();
        saveDataPoints();
    }
};

var onSinglePerf = function(data){
    data._metadata.perfClientReceived = (new Date()).getTime();
    dataPoints.push(data);
    perfReceived++;

    if(perfReceived === 0){
        singlePerfStart = new Date();
        console.log('start perf ' + singlePerfStart);
    }

    if(perfReceived % 100 === 0){
        console.log(perfReceived);
    }

    checkEnd();
};

var _onHttpEnd = (
    config.perfSendOnly ?
    function(){ onSinglePerf(); } :
    function(){ }
    );

var send = function(){ };

config.eventServerHttpHost = 'jedimindtrick6-4000.terminal.com';
config.eventServerHttpPort = 80;
var io = require('./node_modules/socket.io/node_modules/socket.io-client');
var outUrl = 'http://' + config.eventServerHttpHost + ':' + config.eventServerHttpPort;
console.log('connecting to: ' + outUrl);
var webAppSocket = io(outUrl);
webAppSocket.on('connect',function(){
    console.log('connected to web app socket');
    send = function(){
        webAppSocket.emit('POST',{
            WhichEntity: 18,
            Name: "Morticia",
            _metadata: { 
                perfClientSent: (new Date()).getTime()
            }
        });
    };
});


var runSinglePerf = function(){
    dataPoints = [];
    perfReceived = 0;
    perfMax = singlePerfLimit;
    console.log('perfMax ' + perfMax);

    for(var i = 1, l = singlePerfLimit + 11; i <= l; i++){
        send();
    }

};

config.realTimeStoreHttpHost = 'jedimindtrick6-6001.terminal.com';
config.realTimeStoreHttpPort = 80;
var _base = 'http://' + config.realTimeStoreHttpHost + ':' + config.realTimeStoreHttpPort;

var onValue = function(data){};
var socket = null;
var getRef = function(path){

    var root = io(_base);

    root.on('subscribed',function(path){
        console.log('server ack ' + path);
        socket = io(_base + path);

        if(config.perfRoundtrip){
            console.log('perfing round trip');
            socket.on('POST',function(data){
                onSinglePerf(data);
            });
        }

        socket.on('connect',function(){

            runSinglePerf();

        });
    });

    root.on('connect',function(){
        console.log('subscribing to /TestOrg');
        root.emit('subscribe','/TestOrg/current/0');
    });

};

getRef();
