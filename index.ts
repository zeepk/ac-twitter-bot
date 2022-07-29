import express from 'express';
import dotenv from 'dotenv';
import json from './items.json';
const { TwitterApi } = require('twitter-api-v2');
dotenv.config();

const twitterClient = new TwitterApi({
    appKey: process.env.CONSUMER_KEY ?? '',
    appSecret: process.env.CONSUMER_SECRET ?? '',
    accessToken: process.env.ACCESS_TOKEN ?? '',
    accessSecret: process.env.ACCESS_TOKEN_SECRET ?? '',
});

const client = twitterClient.readWrite;

const app = express();

app.get('/', async (req, res) => {
    const list: any[] = Array.of(json);
    const items = list.at(0);
    const itemIndex = Math.floor(Math.random() * items.length);
    const item = items[itemIndex];
    if (!item || !item.variants) {
        res.send('No item found');
    }
    const variant =
        item.variants[Math.floor(Math.random() * item.variants.length)];
    const imageUri = variant.closetImage ?? variant.storageImage;
    await client.v2.tweet(item.name);
    res.send('success');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('The application is listening on port', port);
});
