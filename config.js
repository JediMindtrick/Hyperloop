exports.levelDbLocation = './mydb';
exports.levelDbContainer = './streamStore';

//control gets ports 2000

//input layer
exports.webServerHost = 'localhost';
exports.webServerPort = 3000;

//stream
exports.eventServerHost = 'localhost';
exports.eventServerPort = 4000;

//blp, ports 5000

//store
exports.realTimeStoreHost = 'localhost';
exports.realTimeStorePort = 6000;

exports.zeromqPort = 6500;
exports.zeromqOut = '127.0.0.1';
exports.zeromqIn = '127.0.0.1';



//client - general config
exports.perfRoundtrip = true;
exports.perfSendOnly = false;

//server - general config
exports.perfServerSocketsOnly = false;
exports.connectToStoreViaSockets = false;
