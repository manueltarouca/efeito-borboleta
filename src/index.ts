import axios, { AxiosResponse } from 'axios';
import Parser from 'rss-parser';
import fs, { ReadStream, WriteStream } from 'fs';

const parser = new Parser();

(async () => {
  const feed = await parser.parseURL('https://www.rtp.pt/play/podcast/9832');
  console.log(feed.title);
  const entries = feed.items.map(item => {
    return {
      url: item.enclosure?.url as string,
      name: item.title?.toLowerCase().trim().split(' ').join('-') as string
    }
  });
  console.log(entries)
  for (const entry of entries) {
    const response: AxiosResponse<ReadStream> = await axios.get(entry.url, { responseType: 'stream' });
    await new Promise<void>((resolve, reject) => {
      const writeStream: WriteStream = fs.createWriteStream(`./data/${entry.name}.mp3`);
      response.data.pipe(writeStream);
      writeStream.on('finish', () => {
        console.log(`File downloaded to ${entry.name}.mp3`);
        resolve();
      });
      writeStream.on('error', (error) => {
        reject(error);
      });
    });
  }
})();