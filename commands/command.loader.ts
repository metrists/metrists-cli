import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';
import { ERROR_PREFIX } from '../lib/ui';
import { AbstractCommand } from './abstract.command';
import { WatchCommand } from './watch.command';

export class CommandLoader {
  public static load(program: CommanderStatic): void {
    this.loadCommandAndAction(new WatchCommand(), program);
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

  protected static loadCommandAndAction(command: AbstractCommand, program: CommanderStatic) {
    const commanderCommand = command.load(program);
    commanderCommand.action(async (options) => {
      return await command.handle(commanderCommand);
    });
    return commanderCommand;
  }
}
