/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var store = require('./store.js');
var stream = require('./esStream.js');
var fastlane = require('./fastlane.js');
var config = require('./config');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.json(false));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

// development only
if ('development' == app.get('env')) {

//  app.use(express.errorHandler());
}

app.get('/', function(req, res) {

    res.render('index.html');
});

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
//add socket server
var io = require('socket.io')(server);


//FASTLANE!!!
app.post('/Fastlane/Entity1', fastlane.create);

//app.put('/Fastlane/Entity1', fastlane.update);

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

/*Example of key retrieval
db.get('test20000', function (err, value) {
    if (err) return console.log('Ooops!', err); // likely the key was not found
    // ta da!
    console.log('test20000=' + JSON.stringify(value));
});
*/

app.put('/Fastlane/Entity1', function(req,res){

    res.send('OK');

    if(!config.perfServerSocketsOnly){

        var ent = {some: 'more', complex: 'model'};
        q.push(ent);
        
        _dbCount++;
        db.put('test' + _dbCount,JSON.stringify(ent),function(){
            pushToModel(q.shift());    
        });

    }

});


//ALL BELOW IS FOR SETTING UP "LOCAL FIREBASE"
valRoom = io.of('/TestOrg/current');

//this is the 'out' socket
store.setChannel(io);

app.get('/Store/*',function(req, res){

    var found = store.get(req.url);
    res.send(JSON.stringify(found));
});

app.post('/Store/*',function(req, res){
    var val = null;

    val = req.body._rawValue;

    var result = store.set(req.url, val);
    res.send(JSON.stringify(result));
});

app.put('/Store/*',function(req, res){
    var val = null;

    val = req.body._rawValue;

    var result = store.set(req.url, val);
    res.send(JSON.stringify(result));
});

var nspHash = {};

//subscribe danceroo
io.on('connection',function(socket){
    socket.on('subscribe',function(path){
        console.log('subscribe to ' + path);
        store.setupObservable(path);

        //on connect we want to give caller the current state
        if(!nspHash[path]){

            var nsp = io.of(path);

            nspHash[path] = nsp;

            nsp.on('connection', function(socket){
                console.log('someone connected to ' + path);

                var _val = store.get('/Store' + path);
                console.log('value at ' + path + ' is ' + JSON.stringify(_val));
                if(_val != null){
                  socket.emit('value',_val);
                }
                
                if(config.perfServerSocketsOnly){
                    for(var i = 0, l = 8003; i < l; i++){
                        socket.emit('value',i);
                    }
                }
                
                socket.on('update',function(val){
                    //console.log('received update over socket');
                    var result = store.set('/Store' + path, val);                        
                });

            });

        }

        socket.emit('subscribed',path);
    });
});


if(config.connectToStoreViaSockets){

    var _base = 'http://' + config.realTimeStoreHost + ':' + config.realTimeStorePort;
    var ioClient = require('./node_modules/socket.io/node_modules/socket.io-client');
    var modelSocket = null;

    var getRef = function(path){

        console.log('connecting to storeOut at ' + _base);

        var storeOut = ioClient(_base);

        storeOut.on('subscribed',function(path){
            console.log('server ack ' + path);
            modelSocket = ioClient(_base + path);

            modelSocket.on('connect',function(){
                console.log('connected to /TestOrg/current');
                pushToModel = function(msg){
                    modelSocket.emit('update',msg);
                };
            });
        });

        storeOut.on('connect',function(){
            console.log('subscribing to /TestOrg');
            storeOut.emit('subscribe','/TestOrg/current');
        });

    };

    getRef();

}