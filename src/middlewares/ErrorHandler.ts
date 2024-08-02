import express from 'express';
import HTTPStatus from 'http-status';
import config from '../utils/config';

// TODO better typing
export default function ErrorHandler({
    log,
    hideProdErrors,
}: // biome-ignore lint/complexity/noBannedTypes: <explanation>
{ log?: Function; hideProdErrors?: boolean } = {}): express.ErrorRequestHandler {
    return function errorHandlerMiddleware(err, req, res, next) {
        let status = err.statusCode || HTTPStatus.INTERNAL_SERVER_ERROR;
        const { statusCode, message, stack, prodMessage, ...rest } = err;

        if (status < HTTPStatus.BAD_REQUEST) {
            status = HTTPStatus.BAD_REQUEST;
        }
        // biome-ignore lint/suspicious/noExplicitAny: intentional any
        const body: any = { status, error: message, details: rest.details || rest };
        if (config.get('NODE_ENV') !== 'production') {
            body.stack = err.stack;
        }
        if (hideProdErrors && config.get('NODE_ENV') === 'production' && status >= HTTPStatus.INTERNAL_SERVER_ERROR) {
            body.error = HTTPStatus[status];
        }
        if (log) {
            log({ err, req, res, body });
        }
        res.status(status);
        res.json(body);
    };
}
