export default class DataBaseException extends Error {
    details: unknown;
    constructor(message?: string, detail?: unknown, error?: unknown) {
        super('DataBaseException');

        if (message) {
            super.message = message;
        }
        this.details = detail;

        super.name = 'DataBaseException';
        if (typeof error === 'object') {
            super.stack = JSON.stringify(error);
        } else {
            super.stack = String(error);
        }
        Object.setPrototypeOf(this, DataBaseException.prototype);
    }
}
