var http = require('http');

var singlePerfLimit = 2000;
var maxPerf = singlePerfLimit;
var perfReceived = 0;
var singlePerfStart = new Date();

var checkEnd = function(){
    if(perfReceived >= perfMax){
        var _now = new Date();
        console.log('end perf ' + _now);

        var t1 = _now;
        var t2 = singlePerfStart;
        var dif = t1.getTime() - t2.getTime()

        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        console.log('It took ' + Seconds_from_T1_to_T2 + ' seconds to process ' + singlePerfLimit + ' records');
        console.log('that is ' + (singlePerfLimit / Seconds_from_T1_to_T2) + ' records/sec');

    }
};

var onSinglePerf = function(snapshot){
    perfReceived++;

    if(perfReceived % 100 === 0){
    }

    checkEnd();
};

var send = function(){

    var serializedMsg = JSON.stringify([]);
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': serializedMsg.length
    };

    var options = {
        host: 'localhost',
        port: 3000,
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

        res.on('end', function(data) {

        onSinglePerf(null);

      });
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

}

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

runSinglePerf();
