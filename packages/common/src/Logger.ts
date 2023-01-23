export enum LogLevel {
    Disabled,
    Errors,
    Warnings,
    All,
    Debug,
}
import * as Pino from "pino"

export class Logger {
    private _level: LogLevel;
    private pino: Pino.pino.Logger
    constructor(level: LogLevel) {
        this._level = level
        this.pino = Pino.default()
    }
    debug(msg: object | string) {
        if (this._level >= LogLevel.Debug) {
            this.pino.debug(msg)
        }
    }

    log(msg: object | string) {
        if (this._level >= LogLevel.All) {
            this.pino.info(msg)
        }
    }

    warn(msg: object | string) {
        if (this._level >= LogLevel.Warnings)
            this.pino.warn(msg)
    }
    error(msg: object | string) {
        if (this._level >= LogLevel.Errors)
            this.pino.error(msg)
    }
}