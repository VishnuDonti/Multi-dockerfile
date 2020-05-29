const keys = require( './keys.js');
const redis = require( 'redis');

const client = redis.createClient({
    host : keys.redisHost,
    port : keys.redisPort,
    retry_strategy : () => 1000
});


const sub = client.duplicate();

const fib = function(index) {
    if (index < 2) return 1;
        return fib(index-1) + fib(index-2);
}

sub.on('message', (channel,message) =>{
    console.log('I am adding');
    client.hset('values', message , fib(parseInt(message)));
});

sub.subscribe('insert');