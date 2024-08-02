// import express, { Express, Request, Response } from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
//
// import config from '../../env/config';
// import logger from '../utils/logger';
// import cookieParser from 'cookie-parser';
// import hc, { StatusIndicator } from './healthChecker';
// import * as process from 'node:process';
// import rootController from '../routers/root.controller';
// import { serve as serveSwagger, setup } from 'swagger-ui-express';
//
// const mode = process.env.NODE_ENV;
// const welcomeMsg =
//     mode === 'development'
//         ? '🤖Notification Server: Running on dev mode.🤖'
//         : '💫Notification Server: Running on production mode.💫';
// logger.info(welcomeMsg);
// logger.info(`Container Key: ${containerKey}`);
//
// /** First Page: Server init and build.*/
// const serverTmp: Express = express();
//
// serverTmp.use(rateLimitGuard);
// serverTmp.use(bodyParser.json());
// serverTmp.use(bodyParser.urlencoded({ extended: false }));
// serverTmp.use(cookieParser());
//
// /** Second Phase: Apply Guards and routers */
// //
// if (mode !== 'production') {
//     //* Allow CORS on dev mode
//     logger.info('🛠️[DEV MODE]: Allow cors for all origin.🛠️');
//     serverTmp.use(cors());
// } else {
//     //* Production mode: apply cors global guards
//     serverTmp.use(corsGuard); //* CORS global Guard
// }
//
// /** Third Phase: Apply rest middlewares, remaining guards and interceptors, filters, pipes.*/
// serverTmp.use('/', rootController);
// if (mode !== 'production') {
//     serverTmp.use('/apis', serveSwagger, setup(swaggerSpec));
// }
//
// serverTmp.use(loggingInterceptor); //* Logger Middleware
// serverTmp.use(exceptionFilter); //* Exception Middleware
//
// /** Final Phase: Bootstrap */
// const port = Number.parseInt(config.SERV_PORT);
//
// logger.info('⚙️Bootstrapping... Waiting all dependent services being alive...⚙️');
//
// hc.subscribe({
//     next: ({ source, status }: StatusIndicator) => {
//         logger.info(`${source} - ${status}`);
//     },
//     complete: () => {
//         serverTmp.listen(port, () => {
//             logger.info(`🚀 Bootstrapped! Server is running at http://localhost:${port} 🚀`);
//         });
//     },
//     error: ({ source, status }: StatusIndicator) => {
//         logger.error(`Server Failed to initialized: ${status} - Source: ${source}`);
//         process.exit(1);
//     },
// });
// export default serverTmp;
