var aws = require('./awsconfig'),
local = require('./localconfig');

var _mapConfig = function(cfg){
	for (var prop in cfg){
		if(cfg.hasOwnProperty(prop)){
			exports[prop] = cfg[prop];			
		}
	}
};

if(!process.env.HYPERLOOP_ENV){
	_mapConfig(local);
}else{
	var _env = process.env.HYPERLOOP_ENV.toLowerCase();
	switch(_env){
		case 'aws':
			_mapConfig(aws);
			break;
		case 'local':
			_mapConfig(local);
			break;
		default:
			_mapConfig(local);
			break;
	}
}