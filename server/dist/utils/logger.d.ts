declare class Logger {
    private logDir;
    constructor();
    private formatMessage;
    private writeLog;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, error?: any, meta?: any): void;
}
export declare const logger: Logger;
export default logger;
