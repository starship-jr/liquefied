import * as hyperId from "hyperid";
import { Socket } from "net";
import { Logger, Parser, MessageBuffer, Message } from "@liaison/common";
import { PubSub } from "./pusub";
enum clientState {
    Initialization,
    Connected,
    Disconnected
}

export class Client {
    state: clientState;
    socket: Socket;
    id: string;
    buffer: MessageBuffer;
    pubSub: PubSub;
    logger: Logger;
    channelSlot: Map<string, number>
    constructor(socket: Socket, pubsub: PubSub, logger: Logger) {
        this.state = clientState.Initialization;

        const instance = hyperId()
        this.id = hyperId.decode(instance()).uuid;
        this.socket = socket;
        this.socket.setKeepAlive(true)
        this.socket.setNoDelay(true)
        this.pubSub = pubsub;
        this.logger = logger;
        this.buffer = new MessageBuffer(logger);
        this.channelSlot = new Map();
        this.socket.on("data", (data: string) => this._incommingData(data))
        this.socket.on("close", () => this._disconnectClient())
    }

    private _disconnectClient() {
        this.channelSlot.forEach((slot, subject) => {
            this.pubSub.updateChannel(subject).removeClient(slot)
        })
    }

    private _incommingData(data: string) {
        data = data.toString()
        this.buffer.push(data)
        for (const message of this.buffer.read()) {
            this.dispatchEvent(message)
        }
    }

    private dispatchEvent(message: Message) {
        switch (message.command) {
            case "SUBSCRIBE":
                this.logger.log("New subscribe has been issued")
                const subChannel = this.pubSub.getOrCreateChannel(message.args);
                const slot = subChannel.addClient(this)
                this.channelSlot.set(message.args, slot)
                break;
            case "PUBLISH":
                //this.logger.log("New publish has been issued")
                const pubChannel = this.pubSub.getChannel(message.args);
                if (!!pubChannel) {
                    pubChannel.publishMessage(message.args, message.payload)
                }
                else {
                    this.logger.warn(`No subscriber for this subject : ${message.args}`)

                }

                break;
            case "UNSUSCRIBE":
                const channel = this.pubSub.updateChannel(message.args);
                channel.removeClient(this.channelSlot.get(message.args));
                break;
            default:
                this.logger.warn(`Message received unhandled : ${message}`)
                this.socket.write(`ERROR ${message.args} \nBad request, no command found\r\n\r\n`)
        }
    }
    public notify(subject: string, payload: string) {
        const data = `PUSH ${subject}\n${payload}\r\n\r\n`
        this.socket.write(data)
    }
    public close() {
        this.socket.write("close");
        process.nextTick(() => this.socket.end())
    }
} 