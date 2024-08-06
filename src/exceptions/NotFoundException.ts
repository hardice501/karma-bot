export default class NotFoundException extends Error {
    details: unknown;
    messages: string | undefined;
    constructor(message?: string, detail?: unknown, error?: unknown) {
        super('NotFoundException');
        this.messages = message;
        this.name = 'NotFoundException';
        this.details = detail;

        if (typeof error === 'object') {
            this.stack = JSON.stringify(error);
        } else {
            this.stack = String(error);
        }
    }
}
