import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';
import { InfoCommand } from './info.command';
import { InfoAction } from '../actions/info.action';
import { SyncCommand } from './sync.command';
import { SyncAction } from '../actions/sync.action';
import { WatchCommand } from './watch.command';
import { WatchAction } from '../actions/watch.action';
import { ERROR_PREFIX } from '../lib/ui';

export class CommandLoader {
  public static load(program: CommanderStatic): void {
    new InfoCommand(new InfoAction()).load(program);
    new SyncCommand(new SyncAction()).load(program);
    new WatchCommand(new WatchAction()).load(program);
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: CommanderStatic) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(
        `See ${chalk.red('--help')} for a list of available commands.\n`,
      );
      process.exit(1);
    });
  }
}
