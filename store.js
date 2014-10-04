//var store = {};

var store = { "TestOrg": {"_metadata":{"version":1,"orgName":"TestOrg","entityName":"Entity1",
"cSharpType":"Entities.Entity1","createdDate":"2014-10-04T10:58:24.0442344Z","snapshotFrequency":100},
"current":{"1":{"WhichEntity":1,"Name":"Bob-ff5d61ee-d169-462f-9918-9279b219b1b9","Steps":null,
"_metadata":{"streamName":"TestOrg-Entity1-ff5d61ee-d169-462f-9918-9279b219b1b9",
"streamLocation":"http://192.168.164.150:3117/TestOrg-Entity1-ff5d61ee-d169-462f-9918-9279b219b1b9",
"version":1,"createdDate":"2014-10-04T10:58:24.2161094Z","lastRebuild":"0001-01-01T05:00:00Z",
"lastUpdate":"2014-10-04T10:58:24.2161094Z"},"Id":"ff5d61ee-d169-462f-9918-9279b219b1b9"},
"_metadata":{"streamName":"TestOrg-Entity1","streamLocation":"http://192.168.164.150:1113/TestOrg-Entity1",
"version":1,"createdDate":"2014-10-04T10:58:24.1379844Z","lastRebuild":"2014-10-04T10:58:24.1379844Z",
"lastUpdate":"2014-10-04T10:58:24.1379844Z"}},"snapshots":{"_metadata":{"version":0,
"createdDate":"2014-10-04T10:58:24.1692344Z"}},"replays":{"_metadata":{"version":0,
"createdDate":"2014-10-04T10:58:24.1848594Z"}}}};


var observers = {};
var channel = null;

var setupObservable = function(path){
    if(observers[path]) return;
    observers[path] = channel.of(path);
};

var getElement = function(pathArr, obj){

    if(obj === undefined){
        return null;
    }

    if(pathArr.length == 0){
        return obj;
    }

    var rest = pathArr.length > 1 ? pathArr.slice(1) : [];
    var currObj = obj[pathArr[0]];

    return getElement(rest, currObj);
};

var setElement = function(pathArr, val, obj, builtPath){

    var _newPath = builtPath + '/' + pathArr[0];
    //so we can notify interested parties
    setupObservable(_newPath);

    //we found it!!
    if(pathArr.length == 1){
        obj[pathArr[0]] = val;

        console.log('notifying observers of ' + _newPath);
        console.log('giving them a value ' + val);
        observers[_newPath].emit('value',val);

        return val;
    }

    //we've never visited this node before, set it up
    if(obj[pathArr[0]] == undefined){
        obj[pathArr[0]] = {};
    }

    //keep going down the path
    var _nextNode = obj[pathArr[0]];
    setElement(pathArr.slice(1),val,_nextNode,_newPath);

    //notify after update
    if(observers[_newPath] != undefined){
        console.log('notifying observers of ' + _newPath);
        console.log('giving them a value ' + obj[pathArr[0]]);
        observers[_newPath].emit('value',obj[pathArr[0]]);
    }
};

exports.get = function(path){
    var _stripped = path.toString().replace(/^\/Store\//,'').split('\/');

    return getElement(_stripped,store);
};

exports.set = function(path, val){
    console.log('setting ' + JSON.stringify(val));
    console.log('to ' + path);

    var _stripped = path.toString().replace(/^\/Store\//,'').split('\/');

    var toReturn = setElement(_stripped,val,store,'');

    console.log('store.js returning from set: ' + val);

    return toReturn;
};

exports.setChannel = function(_channel){
    channel = _channel;
};

exports.setupObservable = setupObservable;
