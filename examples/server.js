const {Server,LogLevel}=require("@liquefied/broker")

const broker=new Server("8080",LogLevel.All)
broker.start()