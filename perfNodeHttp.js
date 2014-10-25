var http = require('http');
var config = require('./config.js');

var singlePerfLimit = 10000;
var maxPerf = singlePerfLimit;
var perfReceived = 0;
var singlePerfStart = new Date();
var ended = false;

var checkEnd = function(){
    if(perfReceived >= perfMax && !ended){
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

var send = function(){
/*
    var serializedMsg = JSON.stringify([]);
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': serializedMsg.length
    };

    var options = {
        host: config.webServerHost,
        port: config.webServerPort,
        path: '/Fastlane/Entity1',
        method: 'PUT',
        headers: headers
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data',function(){
        });

        res.on('end',_onHttpEnd);
    });

    req.on('error', function(e) {
        // TODO: handle error.
        errors++;
        console.log('perf POST error count: ' + errors);
        perfMax--;
        checkEnd();

    });

    req.write(serializedMsg);
    req.end();
*/
};

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
            _metadata: { }
        });
    };
});


var runSinglePerf = function(){
    perfReceived = 0;
    perfMax = singlePerfLimit;
    console.log('perfMax ' + perfMax)


    singlePerfStart = new Date();
    console.log('start perf ' + singlePerfStart);

    for(var i = 1, l = singlePerfLimit; i <= l; i++){
        send();
    }

};

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
                onSinglePerf();
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
