# A Nodejs message broker server

This is just a POC at the moment there are **many** missing features and lack of reliabilities.

For a more robust project in NodeJS, you can check [fastmq](https://github.com/arloliu/fastmq). 


## Current features

This is a mono repo typescript project with three sub packages : 

* **broker**, the server message broker which relays messages between the clients
* **client**, a simple client which connects to the broker, you can subscribe on a channel and publish on any channel
* **common**, this is a common utility module for the parsing and logging classes 

To initiate it, first `yarn install` to install all the dev depedencies


As of now, the message protocol looks like this

###### Protocol in use

COMMAND ARGS`LF`PAYLOAD`CRLF` `CRLF`

* A SUBSCRIBE command is sent to the broker to listen on some channel
* A PUBLISH command is sent to relay the message. This is a fire and forget publish, if no client is connected, the message is forgotten
* A PUSH command is received on the client when a message arrives

**A simple example**
```
const Broker = require('../packages/broker/lib/index');
const Client = require('../packages/client/lib/index')
const utils=require('../packages/common/lib/index')

// start the message broker server
const broker = new Broker.Server(8080,utils.LogLevel.All);
broker.start();
//Create a subscriber
const subscriber = new Client.Client(8080, "127.0.0.1",utils.LogLevel.All)
//Create a publisher
const publisher = new Client.Client(8080, "127.0.0.1",utils.LogLevel.All);

async function run() {
    await subscriber.connect();
    // When a new message has been received, trigger the callback
    subscriber.subscribe("hello", async (data) => {
        console.log(`client received data on channel hello : ${data}`)
    })
    subscriber.subscribe("world",async (data)=>{
        console.log(`client received data on channel world : ${data}`)
    })
    
    await publisher.connect();
    publisher.publish("hello", "world from channel hello")
    publisher.publish("world",{hello:'world'})
}

run()
```
## Future plans for next releases

* Improve the API and internal modules
* Make a proper message protocol
* Make a proper parser
* Handle connection failures and reconnection
* Handle acknowldegments and retries
* Prepare some benches and debugs utilities 
* Handle authentication
* Handle tls for secure communications