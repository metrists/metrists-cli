import { CommanderStatic, Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class SyncCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('sync')
      .alias('s')
      .description('Syncs phrases with remote')
      .option('-r, --resolve [path]', 'Resolve path for the JSON files.')
      .option('-f, --fetcher [command]', 'Fetcher command for the project.')
      .option('-e, --env [path]', 'Path to the environment file.')
      .action(async (command: Command) => {
        const { resolve, fetcher, env } = command;
        await this.action.handle({ options: { resolve, fetcher, env } });
      });
  }
}
