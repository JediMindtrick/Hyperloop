var http = require('http');
var store = require('./store.js');
var stream = require('./esStream.js');

var streamQueue = [];
var blpQueue = [];

var enQueue = function(val,arr){
    arr.push(val);
};
var deQueue = function(arr){
    if(arr.length > 0){
        return arr.shift();
    }else{
        return void(0);
    }
};
streamQueue.enqueue = function(val){
    enQueue(val,streamQueue);
};
streamQueue.dequeue = function(){
    return deQueue(streamQueue);
};
streamQueue.inFlight = false;

blpQueue.enqueue = function(val){
    enQueue(val,blpQueue);
};
blpQueue.dequeue = function(){
    return deQueue(blpQueue);
};
blpQueue.inFlight = false;

var pushToModel = function(msg,callback){

    var serializedMsg = JSON.stringify({ _rawValue: msg});
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': serializedMsg.length
    };

    var options = {
      host: '192.168.56.100',
      port: 3000,
      path: '/Store/TestOrg/current/0',
//      method: 'POST',
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
          if(callback !== undefined){
            callback();
          }
      });
    });

    req.on('error', function(e) {
    });

    req.write(serializedMsg);
    req.end();
};

var processBlpQueue = function(){

    //guard empty
    if(blpQueue.length < 1){
        blpQueue.schedule();
        return;
    }

    var top = blpQueue[0];
    blpQueue.inFlight = true;

    var entity = top.data.entity;

    pushToModel(entity,function(){
        blpQueue.inFlight = false;
        blpQueue.dequeue();
        blpQueue.schedule();
    });
};

blpQueue.schedule = function(msg){

    //do work now
    if(!blpQueue.inFlight && blpQueue.length > 0){
        processBlpQueue();

    //do work next tick
    }else if(blpQueue.length > 0){
        setTimeout(blpQueue.schedule,0);

    //no work left :(
    }else{
//        console.log('no work to do');
    }
};

//put request onto queue
//schedule send to stream

//on callback
//enqueue to blp and schedule blp
//process business-logic
//schedule next processing

var processStreamQueue = function(){
    //guard empty
    if(streamQueue.length < 1){
        streamQueue.schedule();
        return;
    }

    var top = streamQueue[0];
    streamQueue.inFlight = true;

    //top.val and top.response
    var id = stream.createEntity(top.val,function(msg){

        streamQueue.inFlight = false;
        //remove the one we just processed
        streamQueue.dequeue();
        streamQueue.schedule();

        //process next blp
        blpQueue.enqueue(msg);
        blpQueue.schedule(msg);//give it the message right now just for testing purposes
    });

    //respond either here or in callback above
    //this way gets the response to the client faster
    top.response.send(id);

    return;
};

streamQueue.schedule = function(){

    //do work now
    if(!streamQueue.inFlight && streamQueue.length > 0){
        processStreamQueue();

    //do work next tick
    }else if(streamQueue.length > 0){
        setTimeout(streamQueue.schedule,0);

    //no work left :(
    }else{
//        console.log('no work to do');
    }
};

//FASTLANE!!!
exports.create = function(req, res){
    var _entity = req.body;

    streamQueue.enqueue({
        val: _entity,
        response: res
    });

    streamQueue.schedule();
};

exports.update = function(req, res){
    var _entity = req.body;

    streamQueue.enqueue({
        val: _entity,
        response: res
    });

    streamQueue.schedule();
};

/*
var test = function(){

    streamQueue.enqueue(1);
    console.log(JSON.stringify(streamQueue));
    streamQueue.enqueue(2);
    console.log(JSON.stringify(streamQueue));
    streamQueue.enqueue(3);
    console.log(JSON.stringify(streamQueue));

    var foo = streamQueue.dequeue();
    console.log(JSON.stringify(foo));
    console.log(JSON.stringify(streamQueue));
    foo = streamQueue.dequeue();
    console.log(JSON.stringify(foo));
    console.log(JSON.stringify(streamQueue));
    foo = streamQueue.dequeue();
    console.log(JSON.stringify(foo));
    console.log(JSON.stringify(streamQueue));

};
*/
