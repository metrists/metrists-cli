import { existsSync, promises } from 'fs';
import { join } from 'path';
import * as chalk from 'chalk';
import { runFetcher } from '../lib/run-fetcher';
import { createDictionaryFiles } from '../lib/utils/file-system/create-dictionary-files';
import { AbstractAction } from './abstract.action';
import { BaseException } from '../exceptions/base.exception';
import type { RcFile } from '../interfaces/rc.interface';

export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    try {
      const { fetcher, resolve, fetcherParams, envPath } =
        await this.resolveOptions(options);
      const output = await runFetcher(fetcher, fetcherParams, envPath);
      await createDictionaryFiles(resolve, output);
    } catch (e) {
      if (e instanceof BaseException) {
        console.error(chalk.red(e.getMessage()));
      } else {
        throw e;
      }
    }
  }

  async resolveOptions(options) {
    const rc = await this.getRCFile();

    return {
      fetcher: options?.fetcher ?? rc?.fetcher,
      resolve: options?.resolve ?? rc?.resolvePath,
      envPath: options?.env ?? rc?.envPath,
      fetcherParams: rc?.fetcherParams ?? {},
    };
  }

  async getRCFile(): Promise<RcFile> {
    const rcPath = join(process.cwd(), '.metristsrc');
    if (existsSync(rcPath)) {
      return JSON.parse(await promises.readFile(rcPath, 'utf8'));
    }
    return;
  }
}
