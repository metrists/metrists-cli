import { CommanderStatic, Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class SyncCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('sync')
      .alias('s')
      .description('Download and process zip files into Metrists.com')
      .option('-r, --resolve [path]', 'Resolve path for the JSON files.')
      .action(async (command: Command) => {
        const { resolve } = command;
        await this.action.handle({ options: { resolve } });
      });
  }
}
