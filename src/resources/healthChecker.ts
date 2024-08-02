import { Observer } from 'rxjs';
import FulguriteIgnitor, { Requisite } from '../libs/FulguriteIgnitor';
import logger from '../utils/logger';

export let readinessStatus = false;

const defaultObserver: Observer<unknown> = {
    next(value) {
        logger.info('Ignitor status changed', value);
    },
    complete() {
        readinessStatus = true;
        logger.info('Ignitor succeeded');
    },
    error(e) {
        logger.error('Ignitor failed', e);
    },
};

export const conditions = {
    // mongoDSInit: Requisite('mongoDSInit', 10000),
};

export default FulguriteIgnitor(conditions, defaultObserver);
