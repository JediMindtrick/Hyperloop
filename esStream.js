var http = require('http');
var uuid = require('node-uuid');

var streamHost = '192.168.164.150';
var streamPort = 2113;
var streamPath = '/streams/Sandbox-Entity1-a';
var streamAuth = 'admin:changeit';

function createEntity(_entity){
    var __id = uuid.v4();

    _entity.Id = __id;

    return {
        eventId: __id,
        eventType: 'ES.EntityCollection.EntityCreatedEvent<Entity1>',
        data: {
            orgName: "Org1",
            entityName: "Entity1",
            entity: _entity,
            metadata: 'eventstore metadata here'
        }
    };
}

function updateEntity(_entity){
    var __id = uuid.v4();

    return {
        eventId: __id,
        eventType: 'ES.EntityCollection.EntityUpdatedEvent<Entity1>',

        data: {
            orgName: "Org1",
            entityName: "Entity1",
            entity: _entity,
            metadata: 'eventstore metadata here'
        }
    };
}

var pushToStream = function(msg){

    var serializedMsg = JSON.stringify(msg);
    var headers = {
        'Content-Type': 'application/vnd.eventstore.events+json',
        'Content-Length': serializedMsg.length
    };

    var options = {
      host: streamHost,
      port: streamPort,
      path: streamPath,
      method: 'POST',
      headers: headers,
      auth: streamAuth
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
    var req = http.request(options, function(res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data',function(){
          console.log('data');
      });

      res.on('end', function(data) {
          console.log('entity create pushed onto stream');
      });
    });

    req.on('error', function(e) {
      // TODO: handle error.
      console.log('error');
    });

    req.write(serializedMsg);
    req.end();

};

exports.createEntity = function(__entity){

    var _entity = createEntity(__entity);
    var _msg = [_entity];
    pushToStream(_msg);
    return _entity.id;
};
exports.updateEntity = function(__entity){

    var _entity = updateEntity(__entity);
    var _msg = [_entity];
    pushToStream(_msg);
    return _entity.id;
};
