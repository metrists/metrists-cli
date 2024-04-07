import { Command, CommanderStatic } from 'commander';

export abstract class AbstractCommand {
  public abstract load(program: CommanderStatic): Command;
  public abstract handle(command: Command): Promise<void>;
}
