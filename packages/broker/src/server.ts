import * as net from 'net'
import { Client } from './client';
import { Logger, LogLevel } from '@liquefied/common';
import { PubSub } from './pusub'

export class Server {
    private _pubsub: PubSub;
    private _server: net.Server;
    private _logger: Logger;
    private port: number;
    constructor(port: number, logLevel?: LogLevel) {
        this.port = port;
        if (!logLevel) {
            logLevel = LogLevel.Warnings
        }
        this._logger = new Logger(logLevel);
        this._pubsub = new PubSub(this._logger);

    }
    public start() {
        this._server = net.createServer();
        this._server.on("connection", (socket: net.Socket) => this._connectionListener(socket))
        this._server.listen(this.port, '127.0.0.1');
    }
    private _connectionListener(socket: net.Socket) {
        this._logger.log(`New connection from : ${socket.remoteAddress}:${socket.remotePort}`)
        const client = new Client(socket, this._pubsub, this._logger);
    }
}