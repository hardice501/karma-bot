import _ from 'lodash';
import dotenv, { DotenvParseOutput } from '@codexsoft/dotenv-flow';
const config = _.get(dotenv.config(), 'parsed') as DotenvParseOutput;

export default config;
