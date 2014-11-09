var _ = require('lodash');

console.log('perf reports logic loaded');

var model = [];
var onNew = function(_newEvents){
	_.forEach(_newEvents,function(evt){
		model = evt;
	});

	return [
		{ path: '/PerfRuns', data: model }
	];
};

exports.logic = onNew;