//ProcessControl gets ports 2000
//ProcessControl is all http
//ProcessControl is just an idea at the moment....


//Http host+port are for both http and websocket (where appropriate)

//input layer
//this serves up our html, but events then go directly to the stream via websockets
exports.webServerHttpHost = 'localhost';
exports.webServerHttpPort = 3000;

//stream
//this is where new events come in via websocket, they go out to the blp via zmq
exports.eventServerHttpHost = 'localhost';
exports.eventServerHttpPort = 4000;
exports.eventServerStoreContainer = './streamStore';

//blp, ports 5000
//this is where new events come in via zmq, they go out to the real time store via zmq
exports.blpServerZmqHost = '127.0.0.1';
exports.blpServerZmqPort = 5000;

//store
//this is where model updates come in via zmq, they go out to all subscribers via websockets
exports.realTimeStoreHttpHost = 'localhost';
exports.realTimeStoreHttpPort = 6000;
exports.realTimeStoreZmqHost = '127.0.0.1';
exports.realTimeStoreZmqPort = 6500;
exports.realTimeStoreContainer = './modelStore';

//TESTING CONFIGS
exports.testStreamName = 'AppTestStream';

//PERF TESTING CONFIGS
//client - general config
exports.perfRoundtrip = true;
exports.perfSendOnly = false;

//server - general config
exports.perfServerSocketsOnly = false;
exports.connectToStoreViaSockets = false;
