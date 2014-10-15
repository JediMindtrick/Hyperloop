exports.levelDbLocation = './mydb';
//host: '10.0.0.42',
exports.realTimeStoreHost = 'localhost';
exports.realTimeStorePort = 3000;

//var _base = 'http://10.0.0.42:3000'; //'http://192.168.56.100:3000';// '' for localhost
exports.webServerHost = exports.realTimeStoreHost;
exports.webServerPort = exports.realTimeStorePort;

//client
exports.perfRoundtrip = true;
exports.perfSendOnly = false;

//server
exports.perfServerSocketsOnly = false;