var uuid = require('node-uuid');
var http = require('http');

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
      host: '192.168.164.143',
      port: 2113,
      path: '/streams/Sandbox-Entity1-f',
      method: 'POST',
      headers: headers,
      auth: 'admin:changeit'
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

var _msg = [createEntity({
    WhichEntity: 5,
    Name: "Fenton",
    _metadata: { }
})];

pushToStream(_msg);

/*
var msg = [updateEntity({
    Id: 'a3a88bf3-9a76-42e0-afff-bccc8b39bf9f',
    WhichEntity: 4,
    Name: "Sandy",
    _metadata: { }
})];
*/
