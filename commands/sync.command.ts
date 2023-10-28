import { CommanderStatic, Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class SyncCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('sync')
      .alias('s')
      .description('Download and process zip files into Metrists.com')
      .option('-b, --book [book]', 'Id of the book to sync')
      .action(async (command: Command) => {
        const { book } = command;
        await this.action.handle({ options: { book } });
      });
  }
}
