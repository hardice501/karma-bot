/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import ErrorHandler from '../middlewares/ErrorHandler';
import { NotFoundHandler } from '../middlewares/NotFoundHandler';
import config from '../utils/config';
import logger from '../utils/logger';

export default function (rootRouter: Router) {
    const nodeEnv = config.get('NODE_ENV');
    if (nodeEnv !== 'production') {
        let envFileName = '.env';
        if (nodeEnv) {
            envFileName += `.${nodeEnv}`;
        }
        logger.info(`Configuration loaded (${envFileName})`, config.value);
        logger.info(config.get('MYSQL_PASSWORD'));
    }

    /**
     * 1. Build Application
     */
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    const corsOrigin =
        config
            .get('CORS_ORIGIN')
            ?.split(',')
            .map((origin) => origin.trim()) || [];
    // to allow CORS
    if (nodeEnv !== 'production') {
        logger.info('cors allowed');
        app.use(cors({ origin: true, credentials: true }));
    } else {
        app.use(cors({ origin: corsOrigin }));
        logger.info(`cors allowed for ${corsOrigin}`);
    }
    const rootPath = nodeEnv === 'production' ? '/api' : '/';
    app.use(cookieParser());
    app.use(rootPath, rootRouter);
    app.use(NotFoundHandler());

    if (config.get('NODE_ENV') === 'production') {
        app.use(
            ErrorHandler({
                // TODO better typing
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                log: ({ err, body }: { err: any; body: any }) => {
                    const { status, message, stack, prodMessage, ...rest } = err;

                    if (prodMessage) {
                        body.message = prodMessage;
                    }
                    if (err.status >= 500) {
                        logger.error(`${status}: ${message}:\n${stack}`, rest);
                    } else {
                        logger.warn(`${status}: ${message}:\n${stack}`, rest);
                    }
                },
                hideProdErrors: true,
            }),
        );
    } else {
        app.use(
            ErrorHandler({
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                log: ({ err, body }: { err: any; body: any }) => {
                    const { status, message, stack, prodMessage, ...rest } = err;

                    if (prodMessage) {
                        body.message = prodMessage;
                    }
                    if (rest) {
                        body.details = rest;
                    }
                    if (err.status >= 500) {
                        logger.error(`${status}: ${message}:\n${stack}`, rest);
                    } else {
                        logger.warn(`${status}: ${message}:\n${stack}`, rest);
                    }
                },
                hideProdErrors: false,
            }),
        );
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    function onError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = `Port ${port}`;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error('error', `${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error('error', `${bind} is already in use`);
                process.exit(1);
                break;
            default:
                logger.error('serverTmp error occurred', error);
                throw error;
        }
    }
    const port = Number.parseInt(config.get('PORT')!);
    app.on('error', onError);
    app.set('port', port);

    return app;
}
