import express from 'express';
import dotenv from 'dotenv';
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
    await client.v2.tweet('Hello, this is a test.');
    res.send('success');
});

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
});
