/**
 * Module dependencies.
 */
var express = require('express'),
http = require('http'),
durableStream = require('./durableEventStream.js'),
subscribeStream = require('./subscribableEventStream.js'),
config = require('../config.js')
getSubscription = require('./subscriptionFactory').getSubscription;

var stream = null;

app = express();

// all environments
app.set('port', process.env.PORT || config.eventServerHttpPort);
app.use(express.json(false));
app.use(express.urlencoded());
app.use(express.methodOverride());

//Enable CORS!!!
//See http://enable-cors.org/server_expressjs.html
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
 });

app.get('/', function(req, res) {
    res.send('stream is really located at /Stream');
});

app.post('/SubscribeStream',function(req,res){    
    console.log('subscription request: ' + JSON.stringify(req.body));
    /*
Request looks sorta like this
{
    streamName: config.testStreamName,
    protocol: 'zmq',
    host: config.blpServerZmqHost,
    port: config.blpServerZmqPort
}
Use streamName to subscribe to the right stream
    */
    //get subscription function
    var subFunc = getSubscription(req.body);
    //TODO: alert monitor so that it can keep tabs on subscriber and make sure it didn't die
    //subscribe to the stream
    stream.subscribe('POST',subFunc);
});

server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);

durableStream.create(config.testStreamName)
.then(function(_new){
  return subscribeStream.create(_new);
})

.then(function(_new){
    stream = _new;

    //expose over all endpoint types (http,wsock,zmq)
    //Http
    app.post('/Stream',function(req,res){
        //promise will give back an array of either {id: ''} and/or {error: ''}
        stream.push(req.body)
        .then(function(writes){
            res.send(writes);
        })
        .fail(function(errors){
            res.status(400)
            .send(errors); //or whatever seems appropriate
        })
    });

    //Websocket, preferred connection for browsers
    io.on('connection',function(socket){

        console.log('someone connected to socket server');

        //follow same semantics as http        
        socket.on('POST',function(val){
            stream.push(val)
            .then(function(writes){
                socket.emit('SUCCESS',writes);
            })
            .fail(function(errors){
                socket.emit('ERROR',errors);
            })
        });
    });

})
.fail(function(err){
    console.log('problem opening durable store!');
    console.log(err);
    throw 'initialization failure';
});