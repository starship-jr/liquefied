import { Client } from "./client";
import { Logger } from '@liquefied/common';

export class PubSub {
    channels: Map<string, Channel>;
    logger: Logger
    constructor(logger: Logger) {
        this.channels = new Map();
        this.logger = logger;
    }

    getChannel(subject: string) {
        if (this.channels.has(subject)) {
            return this.channels.get(subject);
        }
        else {
            return
        }
    }
    getOrCreateChannel(subject: string) {
        let channel: Channel;
        if (!this.channels.has(subject)) {
            channel = new Channel(subject, this.logger)
            this.channels.set(subject, channel)
            this.logger.log(`A new channel has been created : ${subject}`)
        }
        else {
            channel = this.channels.get(subject)
        }
        return channel
    }

    updateChannel(subject: string) {
        if (!this.channels.has(subject))
            return
        const channel = this.channels.get(subject);
        return channel
    }
    removeChannel(subject: string) {
        if (!this.channels.has(subject))
            return
        const channel = this.channels.get(subject);
        channel.delete();
        this.channels.delete(subject);
    }
    getChannels(): any {
        let info: any = [];
        this.channels.forEach((channel, subject) => {
            info.push({ subject: subject, details: channel.getInfo() })
        })
        return info;
    }
}

enum channelState {
    New,
    Open,
    Close
}

export class Channel {
    subscriber: Client[];
    logger: Logger;
    name: string;
    private state: channelState = channelState.New;

    constructor(name: string, logger: Logger) {
        this.subscriber = [];
        this.state = channelState.New
        this.name = name;
        this.logger = logger;
    }

    delete() {
        this.state = channelState.Close;
        for (const client of this.subscriber) {
            client.close();
        }
    }
    addClient(client: Client): number {
        this.logger.log(`A new client has been added on channel ${this.name}`)
        if (this.state === channelState.Close) {
            this.logger.warn("Error:Channel has been closed");
            return -1
        }

        this.subscriber.push(client);
        const id = this.subscriber.length - 1
        return id
    }
    removeClient(slot: number) {
        this.subscriber.splice(slot, 1);
    }
    publishMessage(subject: string, payload: string) {
        for (const subcriber of this.subscriber) {
            subcriber.notify(subject, payload)
        }
    }
    getInfo() {
        return { state: this.state, subscriber: this.subscriber.length }
    }

}