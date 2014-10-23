var Q = require('q'),
http = require('http');

var _create = function(host,port){

	var client = {};

	var _send = function(url,body,verb){
		var toReturn = Q.defer();

	     var serializedMsg = JSON.stringify(body);
	     var headers = {
	        'Content-Type': 'application/json',
	        'Content-Length': serializedMsg.length
	    };

	    var options = {
	        host: host,
	        port: port,
	        path: url,
	        method: verb,
	        headers: headers
	    };

	    // Setup the request.  The options parameter is
	    // the object we defined above.
	    var req = http.request(options, function(res) {
			res.setEncoding('utf-8');

			var responseString = '';//if response came in chunks, we would append them to this string
			res.on('data',function(){
			});

			res.on('end', function(data) {
				toReturn.resolve(data);
			});

	    });


	    req.on('error', function(e) {
	    	toReturn.reject(e);
	    });

	    req.write(serializedMsg);
	    req.end();

		return toReturn.promise;
	};

	client.get = function(url,body){
		return _send(url,body,'GET');
	};

	client.post = function(url,body){
		return _send(url,body,'POST');
	};

	return client;
};

exports.create = _create;