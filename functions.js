var Q = require('q');

exports.retryPromise = function(func,maxTries,deferred,tries,originalErrors){
	var toReturn = deferred ? deferred : Q.defer();

	//null case 1
	var numTries = tries ? tries + 1 : 1;
	if(numTries > maxTries){
		toReturn.reject(originalErrors);
		return;
	} 

	func()
	//null case 2
	.then(function(result){
		toReturn.resolve(result);
	})
	//recursion
	.fail(function(err){
		retry(func,maxTries,toReturn,numTries,err);
	});

	return toReturn.promise;
};