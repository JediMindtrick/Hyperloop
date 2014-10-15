var levelup = require('level');


var singlePerfLimit = 4000;
var maxPerf = singlePerfLimit;
var perfReceived = 0;
var singlePerfStart = new Date();
var ended = false;

// 1) Create our database, supply location and options.
//    This will create or open the underlying LevelDB store.
var db = levelup('./mydb');

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
    }
};

var onSinglePerf = function(){
    perfReceived++;

    if(perfReceived % 100 === 0){
        console.log(perfReceived);
    }

    checkEnd();
};

var write = function(key,val){

// 2) put a key & value
db.put(key, val, function (err) {
  if (err) return console.log('Ooops!', err); // some kind of I/O error
  onSinglePerf();
});

}

var test = function(){

    singlePerfStart = new Date();
    console.log('start perf ' + singlePerfStart);

	for(var i = 0, l = singlePerfLimit; i < l; i++){
		write('foo' + i, i);
	}
};

test();