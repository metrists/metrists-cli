import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { BaseException } from '../exceptions/base.exception';
import { MESSAGES } from '../lib/ui/messages';

export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    try {
      console.log(chalk.green(MESSAGES.SYNC_SUCCESSFUL));
    } catch (e) {
      if (e instanceof BaseException) {
        console.error(chalk.red(e.getMessage()));
      } else {
        throw e;
      }
    }
  }
}
