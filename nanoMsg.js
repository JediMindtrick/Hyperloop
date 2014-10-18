var nano = require('nanomsg');

var pub = nano.socket('push');
var sub = nano.socket('pull');

var addr = 'tcp://10.0.0.42:7789'
pub.bind(addr);
sub.connect(addr);

sub.on('message', function (buf) {
    console.log(buf.toString());
//    pub.close();
//    sub.close();
});

setInterval(function () {
    pub.send("Hello from nanomsg!");
}, 100);