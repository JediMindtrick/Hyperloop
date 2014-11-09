var store = { 
    TestOrg: { 
        PerfRuns: { 
            List: { },
            Completed: { }
        },
        PerfSets: {
            List:{ },
            Completed: { }
        }
    } 
};

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

        var _newVal = obj[pathArr[0]];

        if(_newVal._metadata){
            _newVal._metadata.perfNotifyModelChange = (new Date()).getTime();    
        }        

        observers[_newPath].emit('POST',_newVal);

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
        
        var _newVal = obj[pathArr[0]];

        if(_newVal._metadata){
            _newVal._metadata.perfNotifyModelChange = (new Date()).getTime();
        }        

        observers[_newPath].emit('POST',_newVal);
    }
};

exports.get = function(path){
    var _stripped = path.toString().replace(/^\/Store\//,'').split('\/');

    return getElement(_stripped,store);
};

exports.set = function(path, val){

    var _stripped = path.toString().replace(/^\/Store\//,'').split('\/');

    var toReturn = setElement(_stripped,val,store,'');

    return toReturn;
};

exports.setChannel = function(_channel){
    channel = _channel;
};

exports.setupObservable = setupObservable;
