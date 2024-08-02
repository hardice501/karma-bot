import dotenv from '@codexsoft/dotenv-flow';
import _ from 'lodash';

// user environments and NODE_ENV for config loading
// https://man7.org/linux/man-pages/man7/environ.7.html
const environ = [
    'NODE_ENV',
    'HOME',
    'SHELL',
    'USER',
    'PATH',
    'LANG',
    'TERM',
    'DISPLAY',
    'EDITOR',
    'LOGNAME',
    'MAIL',
    'MANPATH',
    'PWD',
    'OLDPWD',
    'PS1',
    'PS2',
    'HOSTNAME',
    'HOSTTYPE',
    'OSTYPE',
    'MACHTYPE',
    'IFS',
    'SUDO_USER',
    'SUDO_UID',
    'SUDO_GID',
];
const configFromDotenv = _.get(dotenv.config(), 'parsed');
const configFromEnv = process.env || {};

export const config = _.assign({}, configFromDotenv, _.pick(configFromEnv, _.keysIn(configFromDotenv).concat(environ)));

export default {
    value: config,
    env: configFromEnv,
    dotenv: configFromDotenv,
    get: (key: string, fallback?: string) => _.get(config, key, fallback),
};
