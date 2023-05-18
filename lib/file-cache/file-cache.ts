import { promises as fsPromises, createReadStream } from 'fs';
import { join, relative } from 'path';
import { promises as streamPromises } from 'stream';
import cacache = require('cacache');

const readdir = fsPromises.readdir;
const stat = fsPromises.stat;
const readFile = fsPromises.readFile;
const pipeline = streamPromises.pipeline;

export class FileCache {
  private readonly cachePath: string;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
  }

  async loadCache(filePath: string): Promise<void> {
    await this.copyFilesToCache(filePath);
  }

  private async copyFilesToCache(sourcePath: string): Promise<void> {
    const files = await readdir(sourcePath);

    for (const file of files) {
      const filePath = join(sourcePath, file);
      const stats = await stat(filePath);

      if (stats.isDirectory()) {
        await this.copyFilesToCache(filePath);
      } else {
        const cacheKey = relative(sourcePath, filePath);
        const cacheValueStream = createReadStream(filePath);
        const cacheStream = cacache.put.stream(this.cachePath, cacheKey);

        await pipeline(cacheValueStream, cacheStream);
      }
    }
  }

  async readCache(filePath: string): Promise<string | null> {
    const cacheKey = relative(this.cachePath, filePath);

    try {
      const cacheData = await cacache.get(this.cachePath, cacheKey);
      const cacheValue = await readFile(cacheData.path);
      return cacheValue.toString();
    } catch (error) {
      console.error(`Error reading cache for file '${filePath}':`, error);
      return null;
    }
  }
}
