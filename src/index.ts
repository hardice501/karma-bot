import { Client } from 'discord.js';
import config from './utils/config';
const BOT_TOKEN = config.DISCORD_TOKEN;

const client = new Client({
    intents: [],
});

const startBot = async () => {
    await client.login(BOT_TOKEN);
    console.info('info: login success!');
};

startBot();
