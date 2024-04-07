import { CommanderStatic, Command } from 'commander';
import { join } from 'path';
import { copyFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import * as chalk from 'chalk';
import { watch } from 'chokidar';
import { ConfigAwareCommand } from './config-aware.command';
import { spawnAndWait } from '../lib/utils/process.util';
import { getContentsRecursively } from '../lib/utils/fs.util';

export class WatchCommand extends ConfigAwareCommand {
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

  public async handle(command: Command) {
    await this.loadConfig();
    const outDir = this.getConfig((rc) => rc?.outDir);

    this.workingDirectory = process.cwd();

    this.templatePath = join(this.workingDirectory, outDir);
    const templateRepository = this.getConfig((rc) => rc?.template?.repository);

    const templateFilesPath = this.getConfig((rc) => rc?.template?.filesPath);
    this.templateOutputPath = join(this.templatePath, templateFilesPath);

    if (this.pathExists(this.templatePath)) {
      this.copyAllFilesToOutputDirectory(
        this.workingDirectory,
        this.templateOutputPath,
        (filePath) => this.shouldIncludeFile(filePath),
      );
    } else {
      await this.spawnAndWaitAndStopIfError('git', ['clone', templateRepository, outDir]);
      console.log(chalk.green('Successfully Cloned Template'));
      await this.spawnAndWaitAndStopIfError('npm', ['install'], { cwd: outDir });
      console.log(chalk.green('Successfully Installed Dependencies'));
    }

    const devProcessPromise = this.startDevServer();

    const watchFilesPromise = this.watchFiles();
    //   if (!this.shouldIncludeFile(path, templatePath)) {
    //     return;
    //   }

    //   const filePathRelativeToRootWithFileName = path.replace(workingDirectory, '');
    //   const filePathRelativeToRoot = filePathRelativeToRootWithFileName.substring(
    //     0,
    //     filePathRelativeToRootWithFileName.lastIndexOf('/'),
    //   );
    //   const pathTheFileNeedsToCopyInto = join(templateOutputPath, filePathRelativeToRoot);
    //   const finalFilePath = join(templateOutputPath, filePathRelativeToRootWithFileName);

    //   await this.copyFile(path, finalFilePath);
    // });

    await Promise.all([devProcessPromise, watchFilesPromise]);
  }

  protected async startDevServer() {
    return spawnAndWait('npm', ['run', 'dev'], {
      cwd: this.templatePath,
    });
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

  protected watchFiles() {
    const eventToCallback = {
      add: this.handleFileAdded.bind(this),
      change: this.handleFileChanged.bind(this),
      unlink: this.handleFileDeleted.bind(this),
    };
    const watchInstance = watch(this.workingDirectory, { persistent: true, ignoreInitial: true });

    watchInstance.on('all', async (event, path) => {
      if (this.shouldIncludeFile(path)) {
        await eventToCallback[event](path);
      }
    });

    return watchInstance;
  }

  protected async handleFileAdded(path: string) {
    const fileRelativePath = await this.getChangedFileRelativePathToTemplateOutputPath(path);

    return await this.copyFile(path, fileRelativePath);
  }

  protected async handleFileDeleted(path: string) {
    const fileRelativePath = await this.getChangedFileRelativePathToTemplateOutputPath(path);

    return await this.deleteFile(fileRelativePath);
  }

  protected async handleFileChanged(path: string) {
    const fileRelativePath = await this.getChangedFileRelativePathToTemplateOutputPath(path);

    return await this.copyFile(path, fileRelativePath);
  }

  protected async getChangedFileRelativePathToTemplateOutputPath(path: string) {
    const filePathRelativeToRootWithFileName = path.replace(this.workingDirectory, '');

    return join(this.templateOutputPath, filePathRelativeToRootWithFileName);
  }

  protected copyAllFilesToOutputDirectory(
    directoryToLookAt: string,
    outputDirectory: string,
    shouldInclude: (filePath: string) => boolean,
  ) {
    const allFilesPromises = [];
    this.performOnAllFilesInDirectory(directoryToLookAt, async (file) => {
      if (shouldInclude(file)) {
        const relativePath = file.replace(directoryToLookAt, '');
        const outputPath = join(outputDirectory, relativePath);
        allFilesPromises.push(this.copyFile(file, outputPath));
      }
    });

    return Promise.all(allFilesPromises);
  }

  protected async performOnAllFilesInDirectory(
    directoryPath: string,
    cb: (filePath: string) => Promise<void>,
  ) {
    const resultPromises = [];
    for await (const file of getContentsRecursively(directoryPath)) {
      resultPromises.push(cb(file));
    }
    return Promise.all(resultPromises);
  }

  protected async createDirectory(directoryPath: string) {
    return await mkdir(directoryPath, { recursive: true });
  }

  protected async createDirectoryIfNotExists(directoryPath: string) {
    if (!this.pathExists(directoryPath)) {
      return await this.createDirectory(directoryPath);
    }
  }

  protected pathExists(path: string) {
    return existsSync(path);
  }

  protected async copyFile(fromPath: string, toPath: string) {
    return await copyFile(fromPath, toPath);
  }

  protected async deleteFile(path: string) {
    return await unlink(path);
  }
}
