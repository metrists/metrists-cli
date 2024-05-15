import { CommanderStatic, Command } from 'commander';
import { join } from 'path';
import * as chalk from 'chalk';
import { watch } from 'chokidar';
import { InitCommand } from './init.command';
import { spawnAndWait } from '../lib/utils/process.util';
import {
  copyFile,
  deleteFile,
  copyAllFilesFromOneDirectoryToAnother,
  pathExists,
  createDirectory,
} from '../lib/utils/fs.util';

export class WatchCommand extends InitCommand {
  protected outDir: string;
  protected workingDirectory: string;
  protected templatePath: string;
  protected templateOutputPath: string;

  public load(program: CommanderStatic) {
    return program
      .command('watch')
      .alias('w')
      .description('Watch for the changes and sync them into the dev server');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handle(command: Command) {
    await super.handle(command);

    this.workingDirectory = process.cwd();

    const templateFilesPath = this.getConfig((rc) => rc?.template?.filesPath);
    this.templateOutputPath = join(this.templatePath, templateFilesPath);

    await Promise.all([
      this.startDevServer(),
      this.watchFiles(),
      this.startContentLayer(),
    ]);
  }

  protected async startDevServer() {
    return spawnAndWait('npm', ['run', 'dev'], {
      cwd: this.templatePath,
    });
  }

  protected async startContentLayer() {
    return spawnAndWait('npm', ['run', 'dev:content'], {
      cwd: this.templatePath,
    });
  }

  protected watchFiles() {
    const eventToCallback = {
      add: this.handleFileAdded.bind(this),
      change: this.handleFileChanged.bind(this),
      unlink: this.handleFileDeleted.bind(this),
    };
    const watchInstance = watch(this.workingDirectory, {
      persistent: true,
      ignoreInitial: false,
    });

    watchInstance.on('all', async (event, path) => {
      if (this.shouldIncludeFile(path)) {
        await eventToCallback[event](path);
      }
    });

    return watchInstance;
  }

  protected async handleFileAdded(path: string) {
    const fileRelativePath =
      await this.getChangedFileRelativePathToTemplateOutputPath(path);

    return await copyFile(path, fileRelativePath);
  }

  protected async handleFileDeleted(path: string) {
    const fileRelativePath =
      await this.getChangedFileRelativePathToTemplateOutputPath(path);

    return await deleteFile(fileRelativePath);
  }

  protected async handleFileChanged(path: string) {
    const fileRelativePath =
      await this.getChangedFileRelativePathToTemplateOutputPath(path);

    return await copyFile(path, fileRelativePath);
  }

  protected async getChangedFileRelativePathToTemplateOutputPath(path: string) {
    const filePathRelativeToRootWithFileName = path.replace(
      this.workingDirectory,
      '',
    );

    return join(this.templateOutputPath, filePathRelativeToRootWithFileName);
  }
}
