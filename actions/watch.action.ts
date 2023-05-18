import * as chalk from 'chalk';
import { promises } from 'fs';
import { join, resolve } from 'path';
import { diff } from 'deep-diff';
import { watch } from 'chokidar';
import { AbstractAction } from './abstract.action';
import { readRc } from '../lib/utils/read-rc';
import { createLockTree } from '../lib/utils/create-lock-tree';
import { MESSAGES } from '../lib/ui/messages';
import { FileCache } from '../lib/file-cache';
import type { RcFile } from '../interfaces/rc.interface';

const readFile = promises.readFile;

interface FlattenJson {
  [key: string]: any;
}

export class WatchAction extends AbstractAction {
  public async handle() {
    const resolvePath = await this.getResolvePath();

    const cache = new FileCache(join(resolvePath, '.cache'));

    await cache.loadCache(resolvePath);

    // const inMemoryTree = await createLockTree(resolvePath);
    // await this.watchFiles(resolvePath, async (event, path) => {
    //   const pathWithoutJson = path.replace(/.json$/, '');
    //   const oldContent = inMemoryTree[pathWithoutJson];
    //   const newContent = JSON.parse(
    //     await readFile(join(process.cwd(), path), { encoding: 'utf-8' }),
    //   );
    //   console.log(diff(oldContent, newContent));
    // });
  }

  protected watchFiles(
    resolvePath: RcFile['resolvePath'],
    cb: (event: string, path: string) => Promise<void>,
  ) {
    watch(resolvePath, { persistent: true, ignoreInitial: true }).on(
      'all',
      (event, path) => {
        this.displayBanner();
        cb(event, path);
      },
    );
  }

  private displayBanner() {
    const currentDate = new Date();
    console.info(
      chalk.grey(
        `[${currentDate.toDateString()} ${currentDate.toLocaleTimeString()}] ${
          MESSAGES.WATCH_MODE_START
        }`,
      ),
    );
  }

  protected async getResolvePath() {
    const rcContent = (await readRc()) as RcFile;

    return rcContent.resolvePath;
  }
}
