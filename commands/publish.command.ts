import { InitCommand } from './init.command';
import { spawnAndWait } from '../lib/utils/process.util';
import type { Command } from 'commander';

export class PublishCommand extends InitCommand {
  public load(program: Command) {
    return program
      .command('publish')
      .alias('p')
      .description('Publish a production build of the book')
      .option('-o, --out-dir <outDir>', 'Output directory');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handle(command: Command) {
    await super.handle(command);

    this.buildContentLayer().then(this.buildTemplate.bind(this));
  }

  protected async buildTemplate() {
    const buildScript = this.getTemplateConfig((rc) => rc?.buildScript).split(
      ' ',
    );
    return spawnAndWait(buildScript[0], buildScript.slice(1), {
      cwd: this.templatePath,
    });
  }

  protected async buildContentLayer() {
    const buildContentScript = this.getTemplateConfig(
      (rc) => rc?.buildContentScript,
    ).split(' ');
    return spawnAndWait(buildContentScript[0], buildContentScript.slice(1), {
      cwd: this.templatePath,
    });
  }
}
