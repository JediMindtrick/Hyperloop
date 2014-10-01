var store = {};
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

        return val;
    }

    //we've never visited this node before, set it up
    if(obj[pathArr[0]] == undefined){
        obj[pathArr[0]] = {};
    }

    //keep going down the path
    var _nextNode = obj[pathArr[0]];
    setElement(pathArr.slice(1),val,_nextNode,_newPath);
};

var notifyElement = function(pathArr, val, builtPath){

    if(observers[builtPath] != undefined){
        console.log('notifying observers of ' + builtPath);
        console.log('giving them a value ' + val);
        observers[builtPath].emit('value',val);
    }

    if(pathArr.length == 0) {
        return;
    }

    var _newPath = builtPath + '/' + pathArr[0];

    var _newArr = pathArr.length == 1 ? [] : pathArr.slice(1);

    //keep going down the path
    notifyElement(_newArr,val,_newPath);
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

    //notify all observers
    notifyElement(_stripped,val,'');

    return toReturn;
};

exports.setChannel = function(_channel){
    channel = _channel;
};
