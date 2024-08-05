import dotenv from '@codexsoft/dotenv-flow';
import _ from 'lodash';

// user environments and NODE_ENV for config loading
// https://man7.org/linux/man-pages/man7/environ.7.html
const environ = ['NODE_ENV', 'MAILPLUG_ID', 'MAILPLUG_HOST_DOMAIN', 'MAILPLUG_LOGIN_URL', 'MAILPLUG_ATTENDANCE_URL'];
const configFromDotenv = _.get(dotenv.config(), 'parsed');
const configFromEnv = process.env || {};
configFromEnv.NODE_ENV = _.split(configFromEnv.NODE_ENV, '.')[0];

export const config = _.assign({}, configFromDotenv, _.pick(configFromEnv, _.keysIn(configFromDotenv).concat(environ)));

export default {
    value: config,
    env: configFromEnv,
    dotenv: configFromDotenv,
    get: (key: string, fallback?: string) => _.get(config, key, fallback),
};
