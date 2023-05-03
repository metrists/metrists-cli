import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { readRc } from '../lib/utils/read-rc';
import { watch } from 'chokidar';
import { readFileSync } from 'fs';
import { platform, release } from 'os';
import osName = require('os-name');
import { RcFile } from '../interfaces/rc.interface';

export class WatchAction extends AbstractAction {
  public async handle() {
    const resolvePath = await this.getResolvePath();

    watch(resolvePath, { persistent: true, ignoreInitial: true }).on(
      'all',
      (event, path) => {
        console.log(event, path);
        this.displayBanner();
      },
    );
  }

  private displayBanner() {
    const currentDate = new Date();
    console.info(
      chalk.grey(
        `[${currentDate.toDateString()} ${currentDate.toLocaleTimeString()}] Starting Metrists in watch mode...`,
      ),
    );
  }
  private cleanBanner() {
    console.clear();
  }

  protected async getResolvePath() {
    const rcContent = (await readRc()) as RcFile;

    return rcContent.resolvePath;
  }
}
