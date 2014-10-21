/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var store = require('./store.js');
var stream = require('./esStream.js');
var config = require('./config');

var app = express();

// all environments
app.set('port', process.env.PORT || config.webServerPort);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.json(false));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {

    res.render('index.html');
});

/*
//expose over all endpoint types (http,wsock,zmq)
app.post('/Event',function(req,res){
    //promise will give back an array of either {id: ''} and/or {error: ''}
    stream.push(req)
    .then(function(writes){
        res.send(writes);
    })
    .fail(function(errors){
        res.send(errors,400); //or whatever seems appropriate
    })
});
*/

app.post('/Entity1', function(req, res){

    var _id = stream.createEntity(req.body);
    res.send(_id);
});

app.put('/Entity1', function(req, res){

    var _id = stream.updateEntity(req.body);
    res.send(_id);
});

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//FASTLANE!!!
var pushToModel = function(msg){

    var serializedMsg = JSON.stringify({ _rawValue: msg});
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': serializedMsg.length
    };

    var options = {
        host: config.realTimeStoreHost,
        port: config.realTimeStorePort,
        path: '/Store/TestOrg/current/0',
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
      });

    });

    req.on('error', function(e) {
    });

    req.write(serializedMsg);
    req.end();
};

var q = [];

var levelup = require('level');
var db = levelup(config.levelDbLocation);
var _dbCount = 0;

var _update = function(){
    if(!config.perfServerSocketsOnly){

        var ent = {some: 'more', complex: 'model'};
        q.push(ent);

        _dbCount++;
        db.put('test' + _dbCount,JSON.stringify(ent),function(){
            pushToModel(q.shift());
        });

    }
};

//HERE BE WEBSOCKETS!
var io = require('socket.io')(server);
io.on('connection',function(socket){

    console.log('someone connected to socket server');

    //WRITER EVENTS
    socket.on('update',function(val){
        _update();
    });
});

app.get('/Trigger',function(req,res){
    res.send('OK');
    for(var i = 0, l = 10100; i < l; i++){
        pushToModel({some: 'more', complex: 'model'});
    }
});

app.put('/Fastlane/Entity1', function(req,res){

    _update();

    res.send('OK');

});

if(config.connectToStoreViaSockets){

    var _base = 'http://' + config.realTimeStoreHost + ':' + config.realTimeStorePort;
    var ioClient = require('./node_modules/socket.io/node_modules/socket.io-client');
    var modelSocket = null;

    var getRef = function(path){

        console.log('connecting to storeOut at ' + _base);

        var storeOut = ioClient(_base);

        storeOut.on('connect',function(){

            console.log('connected to storeOut at ' + _base);

            pushToModel = function(msg){
                storeOut.emit('update', {path:'/Store/TestOrg/current/0',data: msg});
            };
        });

    };

    getRef();

}


var zmq = require('zmq')
  , sock = zmq.socket('push');
var zmqStore = 'tcp://' + config.zeromqOut + ':' + config.zeromqPort;
sock.connect(zmqStore);
console.log('bound to store at ' + zmqStore);
pushToModel = function(msg){
    sock.send(JSON.stringify({path:'/Store/TestOrg/current/0',data: msg}));
};
