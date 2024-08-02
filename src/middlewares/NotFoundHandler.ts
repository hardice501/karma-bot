import express from 'express';
import HTTPStatus from 'http-status';

// TODO tsdoc
/**
 * Create an express handler middlewares for not found routes
 * @param {Function} [log] the function to log the occurred error
 * @returns {Function} the express middlewares
 */
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function NotFoundHandler({ log }: { log?: Function } = {}): express.RequestHandler {
    return function notFoundHandlerMiddleware(req, res) {
        if (log) {
            log({ req, res });
        }
        res.status(HTTPStatus.NOT_FOUND);
        res.json({
            status: HTTPStatus.NOT_FOUND,
            error: 'route not found',
            details: {
                path: req.path,
            },
        });
    };
}
