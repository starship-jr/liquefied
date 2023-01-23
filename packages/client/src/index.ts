import { Socket } from 'net';
import { Logger, LogLevel, MessageBuffer, Message } from '@liquefied/common';
enum clientState {
    Disconnected,
    Connecting,
    Connected
}
export {LogLevel}

export class Client {
    port: number;
    url: string;
    subject: string;
    role: string;
    id: string;
    logger: Logger;
    buffer: MessageBuffer;
    subjectsHandlers: Map<string, Function>;
    private state: clientState = clientState.Disconnected;
    private socket: Socket
    constructor(port: number, url: string, logLevel?: LogLevel) {
        this.port = port;
        this.url = url;
        this.subjectsHandlers = new Map();
        if (!logLevel) {
            logLevel = LogLevel.Warnings
        }
        this.logger = new Logger(logLevel)
        this.buffer = new MessageBuffer(this.logger);
        this.init()
    }

    private init() {
        this.socket = new Socket();
        this.socket.setKeepAlive(true)
        this.socket.setNoDelay(true)
        this.socket.on("data", (data: string) => this._incommingData(data));
    }



    private _incommingData(data: string) {
        this.buffer.push(data)
        for (const message of this.buffer.read()) {
            this.dispatchEvent(message)
        }
    }


    private dispatchEvent(message: Message) {
        switch (message.command) {
            case "PUSH":
                this.signalHandler(message.args, message.payload);
                break;
            case "PUSH":
                this.signalHandler(message.args, message.payload);
                break;
            default:
                this.logger.warn(message)

        }
    }

    /*
    Retrieve the callback store in the Map
    */
    private signalHandler(subject: string, msg: string) {
        if (this.subjectsHandlers.has(subject)) {
            msg.replace("\/n", "\n")
            msg.replace("\/r", "\r")
            this.subjectsHandlers.get(subject)(msg)
        }

    }

    async connect(): Promise<void> {
        this.state = clientState.Connecting;
        return new Promise((resolve, reject) => {
            this.socket.connect(this.port, this.url, () => {
                this.state = clientState.Connected;
                resolve();
                return;
            })
        })
    }

    async subscribe(subject: string, cb: Function): Promise<void> {
        const payload = `SUBSCRIBE ${subject}\n\r\n\r\n`
        this.socket.write(payload)
        this.subjectsHandlers.set(subject, cb)
    }

    async unsusbscribe(subject: string): Promise<void> {
        const payload = `UNSUBSCRIBE ${subject}\n\r\n\r\n`
        this.socket.write(payload)
    }

    public publish(subject: string, data: string | object) {
        if (this.state !== clientState.Connected) {
            this.logger.warn(`the client is not yet connected, try again later`)
            return
        }
        if (typeof data === "object") {
            data = JSON.stringify(data)
        }
        data.replace("\n", "\/n")
        data.replace("\r", "\/r")
        const payload = `PUBLISH ${subject}\n${data}\r\n\r\n`
        const sent = this.socket.write(payload);
        if (!sent) {
            this.logger.error("Cannot write to socket")
            this.logger.warn(`is socket writable ? ${this.socket.writable}`)
        }


    }

    disconnect() {
        this.state = clientState.Disconnected;
        this.socket.end()
    }


}