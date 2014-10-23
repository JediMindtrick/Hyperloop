/**
 * Module dependencies.
 */
var express = require('express'),
http = require('http'),
path = require('path'),
config = require('../config');

app = express();

// all environments
app.set('port', process.env.PORT || config.webServerHttpPort);
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

server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});