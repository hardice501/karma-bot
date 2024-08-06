export default class DataBaseException extends Error {
    details: unknown;
    messages: string | undefined;
    constructor(message?: string, detail?: unknown, error?: unknown) {
        super('DataBaseException');
        this.messages = message;
        this.name = 'DataBaseException';
        this.details = detail;

        if (typeof error === 'object') {
            this.stack = JSON.stringify(error);
        } else {
            this.stack = String(error);
        }
    }
}
