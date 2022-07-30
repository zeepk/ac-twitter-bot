import express from 'express';
import dotenv from 'dotenv';
import json from './items.json';
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import client from 'https';
dotenv.config();

const downloadImage = (url: string, filepath: string) => {
    return new Promise((resolve, reject) => {
        client.get(url, res => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(
                    new Error(
                        `Request Failed With a Status Code: ${res.statusCode}`
                    )
                );
            }
        });
    });
};

const twitterClient = new TwitterApi({
    appKey: process.env.CONSUMER_KEY ?? '',
    appSecret: process.env.CONSUMER_SECRET ?? '',
    accessToken: process.env.ACCESS_TOKEN ?? '',
    accessSecret: process.env.ACCESS_TOKEN_SECRET ?? '',
});

const tweetClient = twitterClient.readWrite;

const app = express();

app.get('/', async (req, res) => {
    const resp = {
        status: 'error',
        message: '',
        data: {},
    };
    const list: any[] = Array.of(json);
    const items = list[0];
    const itemIndex = Math.floor(Math.random() * items.length);
    const item = items[itemIndex];
    if (!item || !item.variants) {
        resp.message = 'No item found';
        res.json(resp);
    }
    const name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
    const variant =
        item.variants[Math.floor(Math.random() * item.variants.length)];
    const imageUri = variant.closetImage ?? variant.storageImage;
    const img = await downloadImage(imageUri, './image.png');
    const upload = await tweetClient.v1.uploadMedia('./image.png');
    await tweetClient.v2.tweet(name, {
        media: {
            media_ids: [upload],
        },
    });
    resp.status = 'success';
    resp.data = { name, imageUri, img, upload };

    res.json(resp);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('The application is listening on port', port);
});
