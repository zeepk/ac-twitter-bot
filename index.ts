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

const sendTweet = async () => {
    const twitterClient = new TwitterApi({
        appKey: process.env.CONSUMER_KEY ?? '',
        appSecret: process.env.CONSUMER_SECRET ?? '',
        accessToken: process.env.ACCESS_TOKEN ?? '',
        accessSecret: process.env.ACCESS_TOKEN_SECRET ?? '',
    });

    type Variant = {
        closetImage: string;
        storageImage: string;
    };

    type Item = {
        name: string;
        variants: Variant[];
    };

    const tweetClient = twitterClient.readWrite;
    // get random item
    const list: object = Array.of(json);
    const items = list[0] as Item[];
    const itemIndex = Math.floor(Math.random() * items.length);
    const item = items[itemIndex];
    if (!item || !item.variants) {
        console.error('No item found');
        return;
    }
    const name = item.name.charAt(0).toUpperCase() + item.name.slice(1);

    // get random variant
    const variant =
        item.variants[Math.floor(Math.random() * item.variants.length)];

    // get image uri and download
    const imageUri = variant.closetImage ?? variant.storageImage;
    await downloadImage(imageUri, './image.png');
    const upload = await tweetClient.v1.uploadMedia('./image.png');

    // send tweet with image
    const resp = await tweetClient.v2.tweet(name, {
        media: {
            media_ids: [upload],
        },
    });

    if (resp.errors) {
        console.log('errors:', resp.errors);
    } else {
        console.log(`Successfully tweeted: ${name}`);
    }
};

sendTweet();
