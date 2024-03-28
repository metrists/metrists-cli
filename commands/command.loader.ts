import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';
import { SyncCommand } from './sync.command';
import { SyncAction } from '../actions/sync.action';
import { ResetCommand } from './reset.command';
import { ResetAction } from '../actions/reset.action';
import { ERROR_PREFIX } from '../lib/ui';
import { WatchCommand } from './watch.command';
import { WatchAction } from '../actions/watch.action';

export class CommandLoader {
  public static load(program: CommanderStatic): void {
    // new SyncCommand(new SyncAction()).load(program);
    // new ResetCommand(new ResetAction()).load(program);
    new WatchCommand(new WatchAction()).load(program);
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: CommanderStatic) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(`See ${chalk.red('--help')} for a list of available commands.\n`);
      process.exit(1);
    });
  }
}
