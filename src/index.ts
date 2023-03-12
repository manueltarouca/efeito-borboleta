import axios, { AxiosResponse } from 'axios';
import Parser from 'rss-parser';
import { ReadStream } from 'fs';
import { Entry } from './models';
import { downloadFeedItem, executeWhisper, ffmpegConvert, spawnDependencies } from './utils';
import { FEED_URL } from './constants';
import * as dotenv from 'dotenv'
import { readCache, saveCache } from './cache';

dotenv.config();

(async () => {
  spawnDependencies();
  const cache = readCache();
  const parser = new Parser();
  const feed = await parser.parseURL(FEED_URL);
  console.log(feed.title);
  const entries: Entry[] = feed.items.map(item => {
    return {
      url: item.enclosure?.url as string,
      name: item.title?.toLowerCase().trim().split(' ').join('-') as string
    }
  }).reverse().slice(0, 1);
  const notCached = entries.filter(entry => !(cache.map(cacheEntry => cacheEntry.entry.name).includes(entry.name)));
  const cached = entries.filter(entry => cache.map(cacheEntry => cacheEntry.entry.name).includes(entry.name));
  console.log(`Total entries [${entries.length}]`);
  console.log(`Cached entries [${cached.length}]`);
  console.log(`Not cached entries [${notCached.length}]`);
  for (const entry of notCached) {
    const response: AxiosResponse<ReadStream> = await axios.get(entry.url, { responseType: 'stream' });
    await downloadFeedItem(response, entry);
    const output = await ffmpegConvert(entry);
    await executeWhisper(output);
    cache.push({ path: output, entry })
  }
  saveCache(cache);
})().finally(() => console.log('All good 😀'));