var Q = require('q'),
http = require('http'),
_ = require('lodash'),
retry = require('./functions').retryPromise,
io = require('./node_modules/socket.io/node_modules/socket.io-client');

//TODO: memoize use of websockets...if you try to create two sockets to same server, then it looks like it's hanging
//this is inefficient anyway
var _create = function(host,port){

    var deferred = Q.defer();

    var toReturn = {
        send: function(){}
    };

    var _base = 'http://' + host + ':' + port;

    console.log('websocket connecting to event stream at: ' + _base);
    var socket = io(_base);

    socket.on('connect',function(){
        console.log('websocket connected to event stream at ' + _base);

        toReturn.send = function(evt){
            var toSend = _.isArray(evt) ? evt : [evt];
            _.forEach(toSend,function(_evt){
                if(!_evt._metadata){
                    _evt._metadata = {};
                }
                _evt._metadata.streamClientSent = (new Date()).getTime();
            });
            //console.log('stream client sending: ' + JSON.stringify(toSend));
            socket.emit('POST',toSend);
        };

        deferred.resolve(toReturn);
    });

    return deferred.promise;
};

exports.create = _create;