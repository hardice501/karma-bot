export default class DataBaseQueryException extends Error {
    details: unknown;
    constructor(message?: string, detail?: unknown, error?: unknown) {
        super('DataBaseQueryException');

        if (message) {
            super.message = message;
        }
        this.details = detail;

        super.name = 'DataBaseQueryException';
        if (typeof error === 'object') {
            super.stack = JSON.stringify(error);
        } else {
            super.stack = String(error);
        }
        Object.setPrototypeOf(this, DataBaseQueryException.prototype);
    }
}
