const {Server,LogLevel}=require("@liason/broker")

const broker=new Server("8080",LogLevel.All)
broker.start()