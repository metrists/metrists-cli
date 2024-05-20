import { CommanderStatic, Command } from 'commander';
import { join } from 'path';
import * as chalk from 'chalk';
import { ConfigAwareCommand } from './config-aware.command';
import { spawnAndWait } from '../lib/utils/process.util';
import {
  copyAllFilesFromOneDirectoryToAnother,
  pathExists,
  createDirectory,
} from '../lib/utils/fs.util';
import { addToGitIgnore } from '../lib/utils/gitignore.util';

export class InitCommand extends ConfigAwareCommand {
  protected outDir: string;
  protected workingDirectory: string;
  protected templatePath: string;
  protected templateOutputPath: string;

  public load(program: CommanderStatic) {
    return program.command('init').alias('i');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handle(command: Command) {
    await this.loadConfig();

    const outDir = this.getConfig((rc) => rc?.outDir);
    this.workingDirectory = process.cwd();
    this.templatePath = join(this.workingDirectory, outDir);
    const templateFilesPath = this.getConfig((rc) => rc?.template?.filesPath);
    this.templateOutputPath = join(this.templatePath, templateFilesPath);

    if (!pathExists(this.templatePath)) {
      await this.cloneRepository();
      console.log(chalk.green('Successfully Cloned Template'));
      await this.spawnAndWaitAndStopIfError('npm', ['install'], {
        cwd: outDir,
      });
      console.log(chalk.green('Successfully Installed Dependencies'));
      if (!pathExists(this.templateOutputPath)) {
        await createDirectory(this.templateOutputPath);
      }
    }

    await this.createGitIgnoreFile();
  }

  protected async spawnAndWaitAndStopIfError(...args: Parameters<typeof spawnAndWait>) {
    const childProcess = await spawnAndWait(...args);
    if (childProcess.exitCode) {
      process.exit(childProcess.exitCode);
    }
  }

  protected shouldIncludeFile(filePath: string) {
    return filePath.endsWith('.md') && !filePath.includes(this.templatePath);
  }

  protected async createGitIgnoreFile() {
    const itemsToIgnore = [this.getConfig((rc) => rc?.outDir)];
    await addToGitIgnore(this.workingDirectory, itemsToIgnore);
  }

  protected async cloneRepository() {
    const outDir = this.getConfig((rc) => rc?.outDir);
    const templateRepository = this.getConfig((rc) => rc?.template?.repository);
    const branchName = this.getConfig((rc) => rc?.template?.branch);

    let extraOptions = [];
    if (branchName) {
      extraOptions = ['-b', branchName];
    }

    return await this.spawnAndWaitAndStopIfError('git', [
      'clone',
      templateRepository,
      outDir,
      ...extraOptions,
    ]);
  }
}
