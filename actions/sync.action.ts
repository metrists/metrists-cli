import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { BaseException } from '../exceptions/base.exception';
import { MESSAGES } from '../lib/ui/messages';
import { parseRdf } from '../lib/utils/parse-rdf/parse-rdf';
import { join } from 'path';

export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    try {
      console.log(chalk.green(MESSAGES.SYNC_SUCCESSFUL));

      const parsedStuff = await parseRdf(
        join(__dirname, '..', '..', 'data', 'rdf', '1', 'pg1.rdf'),
      );

      console.log(parsedStuff);
    } catch (e) {
      if (e instanceof BaseException) {
        console.error(chalk.red(e.getMessage()));
      } else {
        throw e;
      }
    }
  }
}
