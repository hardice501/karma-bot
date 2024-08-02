import { ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import config from '../utils/config';
import logger from '../utils/logger';
import { conditions } from './healthChecker';

const MongoConnection = mongoConnectionSelector();

MongoConnection.asPromise()
    .then(() => {
        conditions.mongoDSInit.next(true);
        conditions.mongoDSInit.complete();
    })
    .catch((err) => {
        logger.error('Mongoose connection failed', err);
        conditions.mongoDSInit.next(false);
        conditions.mongoDSInit.error(err);
    });

function mongoConnectionSelector(): mongoose.Connection {
    const mongoUri = mongoUriSelector();
    const prodOptions = {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    };
    const devOptions = {
        retryWrites: true,
        retryReads: true,
        tls: false,
        replicaSet: config.get('REPLICA_SET'),
    };
    const mongoOptions = process.env.NODE_ENV === 'production' ? prodOptions : devOptions;
    const mongoConnection = mongoose.createConnection(mongoUri, mongoOptions);
    return mongoConnection;
}

function mongoUriSelector(): string {
    const username = encodeURIComponent(config.get('MONGO_USERNAME') || 'zkrypto');
    const password = encodeURIComponent(config.get('MONGO_PASSWORD') || 'zkrypto');
    const dbName = config.get('MONGO_DATABASE') || 'zkvoting';
    if (process.env.NODE_ENV === 'production') {
        const mongoUri = `mongodb+srv://${username}:${password}@${dbName}.s9k4bta.mongodb.net/?retryWrites=true&w=majority&appName=zkvoting-test`;
        return mongoUri;
    }
    const mongoUri = `mongodb://${config.get('MONGO_HOST')}:${config.get('MONGO_PORT')}`;
    logger.info('Current Environment: Development');
    logger.info(`Development MongoDB URI: ${mongoUri}`);
    return mongoUri;
}

export default MongoConnection;
