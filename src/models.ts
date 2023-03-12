export interface Entry {
  url: string;
  name: string;
}

export interface CacheEntry {
  entry: Entry;
  path: string
}