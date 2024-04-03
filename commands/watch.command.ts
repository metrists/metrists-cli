import { CommanderStatic, Command } from 'commander';
import { join, resolve } from 'path';
import { copyFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as chalk from 'chalk';
import { watch } from 'chokidar';
import { ConfigAwareCommand } from './config-aware.command';
import { spawnAndWait } from '../lib/utils/process.util';
import { getContentsRecursively } from '../lib/utils/fs.util';

export class WatchCommand extends ConfigAwareCommand {
  public load(program: CommanderStatic) {
    return program
      .command('watch')
      .alias('w')
      .description('Watch for the changes and sync them into the dev server');
  }

  public async handle(command: Command) {
    await this.loadConfig();
    const outDir = this.getConfig((rc) => rc?.outDir);

    const workingDirectory = process.cwd();

    const templatePath = join(workingDirectory, outDir);
    const templateRepository = this.getConfig((rc) => rc?.template?.repository);

    const templateFilesPath = this.getConfig((rc) => rc?.template?.filesPath);
    const templateOutputPath = join(templatePath, templateFilesPath);
    await this.createOutputDirectoryIfNotExists(
      templatePath,
      templateRepository,
      templateOutputPath,
      outDir,
      workingDirectory,
    );

    const devProcess = await this.startDevServer(templatePath);
    this.watchFiles(workingDirectory, async (event, path) => {
      if (this.shouldIncludeFile(path, templateOutputPath)) {
        return;
      }
      const filePathRelativeToRootWithFileName = path.replace(workingDirectory, '');
      const filePathRelativeToRoot = filePathRelativeToRootWithFileName.substring(
        0,
        filePathRelativeToRootWithFileName.lastIndexOf('/'),
      );
      const pathTheFileNeedsToCopyInto = join(templateOutputPath, filePathRelativeToRoot);
      const finalFilePath = join(templateOutputPath, filePathRelativeToRootWithFileName);

      await this.copyFile(path, finalFilePath);
    });
  }

  protected async startDevServer(outputPath) {
    return spawnAndWait('npm', ['run', 'dev'], {
      cwd: outputPath,
    });
  }

  protected async createOutputDirectoryIfNotExists(
    outputPath: string,
    templateRepository: string,
    templateOutputPath: string,
    outDir: string,
    workingDirectory: string,
  ) {
    if (!this.pathExists(outputPath)) {
      const clone = await spawnAndWait('git', ['clone', templateRepository, outDir]);
      if (clone.exitCode !== 0) {
        process.exit(clone.exitCode);
      }

      const install = await spawnAndWait('npm', ['install'], { cwd: outDir });
      if (install.exitCode !== 0) {
        process.exit(install.exitCode);
      }
      console.log(chalk.green('Installed the dependencies successfully'));
    } else {
      this.copyAllFilesToOutputDirectory(workingDirectory, templateOutputPath, (filePath) =>
        this.shouldIncludeFile(filePath, outputPath),
      );
    }
  }

  protected shouldIncludeFile(filePath: string, outputPath: string) {
    return filePath.endsWith('.md') && !filePath.includes(outputPath);
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

  protected watchFiles(resolvePath: string, cb: (event: string, path: string) => Promise<void>) {
    watch(resolvePath, { persistent: true, ignoreInitial: true }).on('all', (event, path) => {
      cb(event, path);
    });
  }

  private displayBanner() {
    const currentDate = new Date();
    console.info(
      chalk.grey(
        `[${currentDate.toDateString()} ${currentDate.toLocaleTimeString()}] Starting Metrists in watch mode...`,
      ),
    );
  }
}
