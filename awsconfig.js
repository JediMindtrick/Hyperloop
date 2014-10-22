exports.levelDbLocation = './mydb';


//control gets ports 2000

//input layer
exports.webServerHost = '54.69.187.161';
exports.webServerPort = 3000;

//stream
exports.eventServerHost = '54.69.187.161';
exports.eventServerPort = 4000;

//blp, ports 5000

//store
exports.realTimeStoreHost = '172.31.25.144';
exports.realTimeStorePort = 6000;

exports.zeromqPort = 6500;
exports.zeromqOut = '172.31.25.144';
exports.zeromqIn = '172.31.25.144';



//client - general config
exports.perfRoundtrip = true;
exports.perfSendOnly = false;

//server - general config
exports.perfServerSocketsOnly = false;
exports.connectToStoreViaSockets = false;
