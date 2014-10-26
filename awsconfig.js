//ProcessControl gets ports 2000
//ProcessControl is all http
//ProcessControl is just an idea at the moment....

//hyperloop3
var machine1private = '172.31.25.144';//store
var machine1public = '54.69.199.211';

//hyperloop0
var machine2private = '172.31.19.94';
var machine2public = '54.69.187.161';//web, stream

//Http host+port are for both http and websocket (where appropriate)

//input layer
//this serves up our html, but events then go directly to the stream via websockets
exports.webServerHttpHost = machine1public;
exports.webServerHttpPort = 3000;

//stream
//this is where new events come in via websocket, they go out to the blp via zmq
exports.eventServerHttpHost = machine1public;
exports.eventServerHttpPort = 4000;
exports.eventServerStoreContainer = './streamStore';

//blp, ports 5000
//this is where new events come in via zmq, they go out to the real time store via zmq
exports.blpServerZmqHost = machine1private;
exports.blpServerZmqPort = 5000;

//store
//this is where model updates come in via zmq, they go out to all subscribers via websockets
exports.realTimeStoreHttpHost = machine1private;
exports.realTimeStoreHttpPort = 6001;
exports.realTimeStoreZmqHost = machine1private;
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
