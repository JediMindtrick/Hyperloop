/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var store = require('./store.js');
var stream = require('./esStream.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json(false));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

// development only
if ('development' == app.get('env')) {

  app.use(express.errorHandler());
}

app.get('/', function(req, res) {

    res.render('index.html');
});

app.post('/Entity1', function(req, res){

//    console.log('create: ' +  req.body);
    var _id = stream.createEntity(req.body);
    res.send(_id);
});

app.put('/Entity1', function(req, res){

//    console.log('update: ' + JSON.stringify(req.body));
    var _id = stream.updateEntity(req.body);
    res.send(_id);
});

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});











//ALL BELOW IS FOR SETTING UP "LOCAL FIREBASE"
var io = require('socket.io')(server);

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

//subscribe danceroo
io.on('connection',function(socket){
    socket.on('subscribe',function(path){
        console.log('subscribe to ' + path);
        store.setupObservable(path);

        //on connect we want to give caller the current state
        var nsp = io.of(path);
        nsp.on('connection', function(socket){
            console.log('someone connected to ' + path);
            var _val = store.get('/Store' + path);
            console.log('value at ' + path + ' is ' + JSON.stringify(_val));
            if(_val != null){
              socket.emit('value',_val);
            }
        });

        socket.emit('subscribed',path);
    });
});
