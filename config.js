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

exports.perfEventsHost = '54.69.199.211';
exports.perfEventsPort = 4000;