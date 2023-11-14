import { CommanderStatic, Command } from 'commander';
import { AbstractCommand } from './abstract.command';

export class ResetCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('reset')
      .alias('r')
      .description('Reset the cli')
      .option('-f, --force', 'Force reset')
      .action(async (command: Command) => {
        const { force } = command;
        return await this.action.handle({ options: { force } });
      });
  }
}
