var _mapConfig = function(cfg){
	for (var prop in cfg){
		if(cfg.hasOwnProperty(prop)){
			exports[prop] = cfg[prop];			
		}
	}
};

if(!process.env.HYPERLOOP_ENV){
	_mapConfig(require('./localconfig'));
}else{
	var _env = process.env.HYPERLOOP_ENV.toLowerCase();
	switch(_env){
		case 'hyperloopa':
			_mapConfig(require('./configA'));
			break;
		case 'aws':
			_mapConfig(require('./awsconfig'));
			break;
		case 'local':
			_mapConfig(require('./localconfig'));
			break;
		default:
			_mapConfig(require('./localconfig'));
			break;
	}
}

var a = require('./configA');
exports.perfEventsHost = a.eventServerHttpHost;
exports.perfEventsPort = a.eventServerHttpPort;