var http = require('http'),
config = require('../config.js'),
uuid = require('node-uuid'),
streamClient = require('../streamClient'),
perfRun = require('./perfRun');

var currentPerfRun = null;
var client = null;
var onSinglePerf = function(data){
    data._metadata.perfClientReceived = (new Date()).getTime();

    if(data._metadata.startPerfRun && (!currentPerfRun || currentPerfRun.finished)){
        //create a new perf run
        currentPerfRun = perfRun.create(data,client);
    }

    if(currentPerfRun && !currentPerfRun.finished){
        currentPerfRun.perf(data);
    }
};

config.realTimeStoreHttpHost = 'jedimindtrick8-6001.terminal.com';
config.realTimeStoreHttpPort = 80;
var _base = 'http://' + config.realTimeStoreHttpHost + ':' + config.realTimeStoreHttpPort;

var onValue = function(data){};
var socket = null;
var root = null;
var io = require('../node_modules/socket.io/node_modules/socket.io-client');
var getRef = function(){
    console.log('connecting to ' + _base);

    root = io(_base);

    root.on('subscribed',function(path){
        console.log('server ack ' + path);
        socket = io(_base + path);

        socket.on('POST',function(data){
            onSinglePerf(data);
        });

        socket.on('connect',function(){
            console.log('subscribed to /TestOrg/current/0');
        });
    });

    root.on('connect',function(){
        console.log('subscribing to /TestOrg');
        root.emit('subscribe','/TestOrg/current/0');
    });

};

streamClient.create('localhost',4000)
//streamClient.create(config.perfEventsHost,config.perfEventsPort)
.then(function(_cl){
    console.log('report event stream client created');
    console.log('now listening for model updates');
    client = _cl;
    getRef();
});
