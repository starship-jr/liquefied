import { Logger } from "./Logger";
import { Parser } from "./Parser";
import { Message } from "./types";

export class MessageBuffer {
    private buffer: string;
    private logger: Logger
    constructor(logger: Logger) {
        this.buffer = ''
        this.logger = logger
    }

    push(data: string) {
        this.buffer += data
    }

    read() {
        this.logger.debug(this.buffer)
        const { messages, pending } = Parser.parse(this.buffer)
        this.logger.debug(`Received ${messages.length} messages`)
        this.buffer = pending;
        return messages;

    }



}