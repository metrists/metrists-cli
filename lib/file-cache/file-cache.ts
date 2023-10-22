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
        if (file.endsWith('.cache')) {
          continue;
        }
        await this.copyFilesToCache(filePath);
      } else {
        const cacheValueStream = createReadStream(filePath);
        const cacheStream = cacache.put.stream(this.cachePath, filePath);

        await pipeline(cacheValueStream, cacheStream);
      }
    }
  }

  async readCache(filePath: string): Promise<string | null> {
    return await await cacache.get(this.cachePath, filePath);
  }
}
