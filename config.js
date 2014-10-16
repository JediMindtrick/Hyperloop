exports.levelDbLocation = './mydb';

//input layer
exports.webServerHost = 'localhost';
exports.webServerPort = 3000;

//store
exports.realTimeStoreHost = 'localhost';
exports.realTimeStorePort = 4000;


exports.zeromqPort = 5000;
exports.zeromqOut = '127.0.0.1';
exports.zeromqIn = '127.0.0.1';



//client - general config
exports.perfRoundtrip = true;
exports.perfSendOnly = false;

//server - general config
exports.perfServerSocketsOnly = false;
exports.connectToStoreViaSockets = false;
