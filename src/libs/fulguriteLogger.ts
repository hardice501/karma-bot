import _ from 'lodash';
import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';

/**
 * @typedef {object}    CONFIG_LOG
 * @property {string}  [file_level='debug']
 * @property {string}  [console_level='debug']
 * @property {string}  [logPath='./log']
 */

/**
 * @param userTransports
 * @param {CONFIG_LOG} config
 * @returns {winston.Logger}
 */

interface CreateLoggerOpts {
    userTransports?: Transport[];
    levels?: {
        file?: string;
        console?: string;
    };
    logfilePath?: string;
    fileLogOpts?: winstonDailyRotateFile.DailyRotateFileTransportOptions;
}

const DefaultLogLevel = {
    file: 'debug',
    console: 'debug',
};

function createLogger(opts: CreateLoggerOpts = {}): winston.Logger {
    const transports = opts.userTransports || [];
    const logLevels = { ...DefaultLogLevel, ...opts.levels };

    // Winston Daily Rotate File : https://github.com/winstonjs/winston-daily-rotate-file
    const LOG_FILE_LEVEL = logLevels.file || 'debug';
    if (LOG_FILE_LEVEL !== 'disable') {
        const defaultOptions = {
            level: LOG_FILE_LEVEL,
            dirname: opts.logfilePath || './log',
            filename: `${process.env.npm_package_name}-%DATE%.log`,
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '50',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        };
        const rotatedTransport = new winstonDailyRotateFile(_.assign({}, defaultOptions, opts.fileLogOpts));
        /**
         * @property {function} winston.transports.DailyRotateFile.prototype.on - rotate hook
         */
        rotatedTransport.on('rotate', (oldFilename, newFilename) => {
            logger.info(`logfile rotated, oldFileName: ${oldFilename}, newFileName${newFilename}`);
        });
        transports.push(rotatedTransport);
    }

    // Winston Console Transports
    const LOG_CONSOLE_LEVEL = logLevels.console || 'debug';
    if (LOG_CONSOLE_LEVEL !== 'disabled') {
        // https://github.com/winstonjs/winston/blob/master/docs/transports.md
        const consoleTransport = new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.align(),
                winston.format.timestamp(),
                winston.format.printf((info) => {
                    const { timestamp, level, message, ...args } = info;
                    const ts = timestamp.replace('T', ' ');
                    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? `\n${prettyJ(args)}` : ''}`;
                }),
            ),
            level: LOG_CONSOLE_LEVEL,
        });
        transports.push(consoleTransport);
    }

    const logger: winston.Logger = winston.createLogger({
        levels: winston.config.syslog.levels,
        transports: transports,
    });

    // colorize stringified json on terminal
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    function prettyJ(json: any) {
        let stringified = '';
        if (typeof json !== 'string') {
            stringified = JSON.stringify(json, undefined, 2);
        }
        return stringified.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            (match: any) => {
                let cls = '\x1b[36m';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = '\x1b[34m';
                    } else {
                        cls = '\x1b[32m';
                    }
                } else if (/true|false/.test(match)) {
                    cls = '\x1b[35m';
                } else if (/null/.test(match)) {
                    cls = '\x1b[31m';
                }
                return `${cls + match}\x1b[0m`;
            },
        );
    }

    /**
     * @alias
     * @deprecated use warning instead
     * @returns {Logger}
     */
    logger.warn = logger.warning;

    return logger;
}

export default createLogger;
