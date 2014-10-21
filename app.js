/**
 * Module dependencies.
 */
var express = require('express'),
http = require('http'),
path = require('path'),
store = require('./store.js'),
stream = require('./esStream.js'),
ds = require('./durableEventStream.js'),
config = require('./config');

app = express();

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

var es = null;
ds.create('AppTestStream')
.then(function(obj){
    es = obj;

    //expose over all endpoint types (http,wsock,zmq)
    app.post('/Event',function(req,res){
        //promise will give back an array of either {id: ''} and/or {error: ''}
        es.push(req.body)
        .then(function(writes){
            res.send(writes);
        })
        .fail(function(errors){
            res.status(400)
            .send(errors); //or whatever seems appropriate
        })
    });


})
.fail(function(err){
    console.log('problem opening durable store!');
    console.log(err);
    throw 'initialization failure';
});


app.post('/Entity1', function(req, res){

     _id = stream.createEntity(req.body);
    res.send(_id);
});

app.put('/Entity1', function(req, res){

     _id = stream.updateEntity(req.body);
    res.send(_id);
});

 server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//FASTLANE!!!
 pushToModel = function(msg){

     serializedMsg = JSON.stringify({ _rawValue: msg});
     headers = {
        'Content-Type': 'application/json',
        'Content-Length': serializedMsg.length
    };

     options = {
        host: config.realTimeStoreHost,
        port: config.realTimeStorePort,
        path: '/Store/TestOrg/current/0',
        method: 'PUT',
        headers: headers
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
     req = http.request(options, function(res) {
      res.setEncoding('utf-8');

       responseString = '';

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

 q = [];

 levelup = require('level');
 db = levelup(config.levelDbLocation);
 _dbCount = 0;

 _update = function(){
    if(!config.perfServerSocketsOnly){

         ent = {some: 'more', complex: 'model'};
        q.push(ent);

        _dbCount++;
        db.put('test' + _dbCount,JSON.stringify(ent),function(){
            pushToModel(q.shift());
        });

    }
};

//HERE BE WEBSOCKETS!
 io = require('socket.io')(server);
io.on('connection',function(socket){

    console.log('someone connected to socket server');

    //WRITER EVENTS
    socket.on('update',function(val){
        _update();
    });
});

app.get('/Trigger',function(req,res){
    res.send('OK');
    for( i = 0, l = 10100; i < l; i++){
        pushToModel({some: 'more', complex: 'model'});
    }
});

app.put('/Fastlane/Entity1', function(req,res){

    _update();

    res.send('OK');

});

if(config.connectToStoreViaSockets){

     _base = 'http://' + config.realTimeStoreHost + ':' + config.realTimeStorePort;
     ioClient = require('./node_modules/socket.io/node_modules/socket.io-client');
     modelSocket = null;

     getRef = function(path){

        console.log('connecting to storeOut at ' + _base);

         storeOut = ioClient(_base);

        storeOut.on('connect',function(){

            console.log('connected to storeOut at ' + _base);

            pushToModel = function(msg){
                storeOut.emit('update', {path:'/Store/TestOrg/current/0',data: msg});
            };
        });

    };

    getRef();

}


 zmq = require('zmq')
  , sock = zmq.socket('push');
 zmqStore = 'tcp://' + config.zeromqOut + ':' + config.zeromqPort;
sock.connect(zmqStore);
console.log('bound to store at ' + zmqStore);
pushToModel = function(msg){
    sock.send(JSON.stringify({path:'/Store/TestOrg/current/0',data: msg}));
};
