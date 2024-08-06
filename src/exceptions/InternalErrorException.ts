export default class InternalErrorException extends Error {
    details: unknown;
    messages: string | undefined;
    constructor(message?: string, detail?: unknown, error?: unknown) {
        super('InternalErrorException');
        this.messages = message;
        this.name = 'InternalErrorException';
        this.details = detail;

        if (typeof error === 'object') {
            this.stack = JSON.stringify(error);
        } else {
            this.stack = String(error);
        }
    }
}
