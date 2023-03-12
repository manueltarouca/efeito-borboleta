import { AxiosResponse } from 'axios';
import { exec } from 'child_process';
import fs, { ReadStream, WriteStream } from 'fs';
import { Entry } from './models';

export function downloadFeedItem(response: AxiosResponse<ReadStream>, entry: Entry) {
  return new Promise<void>((resolve, reject) => {
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

export function ffmpegConvert(entry: Entry) {
  return new Promise<string>((resolve, reject) => {
    const input = `./data/${entry.name}.mp3`;
    const output = `./data/${entry.name}.wav`;
    const execution = exec(`ffmpeg -i "${input}" "${output}"`);
    execution.on('close', () => {
      console.log(`File converted to ${output}`);
      resolve(output);
    });
    execution.on('error', () => {
      reject();
    });
    
  });
}

export function executeWhisper(entry: string) {
  return new Promise<void>((resolve, reject) => {
    const execution = exec(`whisperx --model large-v2 --language pt ${entry} --hf_token "${process.env.HF_TOKEN}"`);
    execution.on('close', () => {
      console.log(`Transcription done on ${entry}`);
      resolve();
    });

    execution.stdout?.on('data', (data) => {
      console.log(`${data}`);
    });

    execution.on('error', () => {
      reject();
    });
  });
}

export function spawnDependencies() {
  fs.mkdirSync('./data/cache', { recursive: true });
}