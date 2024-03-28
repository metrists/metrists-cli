import { CommanderStatic, Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class WatchCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('watch')
      .alias('w')
      .description('Watch for the changes and sync them into the dev server')
      .action(async (command: Command) => {
        return await this.action.handle({ options: {} });
      });
  }
}
