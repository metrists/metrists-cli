import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';

export class WatchCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('watch')
      .alias('w')
      .description('Watch project files for changes.')
      .action(async () => {
        await this.action.handle();
      });
  }
}
