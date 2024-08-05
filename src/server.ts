import createExpressServer from './libs/createExpressServer';
import { Attendance } from './models/models';
import HealthChecker from './resources/healthChecker';
import Router from './routers/routers';
import logger from './utils/logger';

const adminAPIServer = createExpressServer(Router);
const port = adminAPIServer.get('port');

Attendance.find({});
HealthChecker.subscribe({
    complete() {
        adminAPIServer.listen(port, () => logger.info(`server start on port: ${port}`));
    },
    error(error: unknown) {
        logger.error('failed to initialized', error);
        process.exit(1);
    },
});
