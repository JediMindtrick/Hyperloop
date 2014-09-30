var store = {'fizz':'buzz','al': {
    '0': true
}};

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

exports.get = function(path){
    var _stripped = path.toString().replace(/^\/Store\//,'').split('\/');

    return getElement(_stripped,store);
};
