import fs from 'fs';
import { CacheEntry } from './models';

const CACHE_FILE = './data/cache/cache.json';

export function readCache(): CacheEntry[] {
  try {
    fs.statSync(CACHE_FILE);
    const cache: CacheEntry[] = JSON.parse(fs.readFileSync(CACHE_FILE, { encoding: 'utf-8' }));
    console.log(`Cache found, read [${cache.length}] entries`);
    return cache;
  } catch (error) {
    console.log('No cache found.');
    return [];
  }
}

export function saveCache(cache: CacheEntry[]): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), { encoding: 'utf-8' });
}