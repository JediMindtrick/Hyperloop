//see https://www.npmjs.org/package/pubsub-js
var pubsub = require('pubsub-js');

var mySubscriber = function( msg, data ){
    console.log( msg, data );
};

// add the function to the list of subscribers for a particular topic
// we're keeping the returned token, in order to be able to unsubscribe
// from the topic later on
var token = pubsub.subscribe( 'MY TOPIC', mySubscriber );

// publish a topic asyncronously
pubsub.publish( 'MY TOPIC', {msg: 'hello world!'} );

// publish a topic syncronously, which is faster in some environments,
// but will get confusing when one topic triggers new topics in the
// same execution chain
// USE WITH CAUTION, HERE BE DRAGONS!!!
pubsub.publishSync( 'MY TOPIC', 'hello world!' );