const {Client,LogLevel}=require('@liason/client')
const subscriber = new Client(8080, "127.0.0.1",LogLevel.All)
//Create a publisher
const publisher = new Client(8080, "127.0.0.1",LogLevel.All);
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
