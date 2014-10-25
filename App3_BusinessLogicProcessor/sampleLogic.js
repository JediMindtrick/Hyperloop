var _ = require('lodash');

var model = [];
var onNew = function(_newEvents){
	_.forEach(_newEvents,function(evt){
		model = evt;
//		model.push(evt);
	});
	//send to store directly, or return an array of paths and values
	//sock.send(JSON.stringify({path:'/Store/TestOrg/current/0',data: msg}));
	return [
		{ path: '/Store/TestOrg/current/0', data: model }
	];
};

exports.logic = onNew;