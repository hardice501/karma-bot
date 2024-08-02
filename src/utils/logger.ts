import config from './config';

import FulguriteLogger from '../libs/fulguriteLogger';

export default FulguriteLogger({
    levels: {
        file: config.get('LOG_LEVEL_FILE', 'debug'),
        console: config.get('LOG_LEVEL_CONSOLE', 'debug'),
    },
});
