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
import { createOrModifyMetaFile } from '../lib/utils/meta-filler.util'

export class InitCommand extends ConfigAwareCommand {
  protected outDir: string;
  protected workingDirectory: string;
  protected templatePath: string;
  protected templateContentPath: string;
  protected templateAssetsPath: string;
  protected ignoredFiles = ['.gitignore', '.metristsrc'];
  protected ignoredDirectories = ['.git'];

  public load(program: CommanderStatic) {
    return program.command('init').alias('i');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handle(command: Command) {
    await this.loadRcConfig();

    this.workingDirectory = process.cwd();
    const outDir = this.getRc((rc) => rc?.outDir);
    this.workingDirectory = process.cwd();
    this.templatePath = join(this.workingDirectory, outDir);

    const isFirstRun = this.isFirstRun(this.templatePath);

    if (isFirstRun) {
      await this.cloneAndInstallTemplate();
    }

    await createOrModifyMetaFile(this.workingDirectory);

    await this.loadTemplateConfig();

    const templateContentRelativePath = this.getTemplateConfig((rc) => rc?.contentPath);
    this.templateContentPath = join(this.templatePath, templateContentRelativePath);
    const templateAssetsRelativePath = this.getTemplateConfig((rc) => rc?.assetsPath);
    this.templateAssetsPath = join(this.templatePath, templateAssetsRelativePath);

    const createGitIGnoreAndCopyFilesPromise: Promise<any>[] = [this.createGitIgnoreFile()];

    if (isFirstRun) {
      createGitIGnoreAndCopyFilesPromise.concat(this.copyAssetsAndContentFilesToTemplate());
    }

    await Promise.all(createGitIGnoreAndCopyFilesPromise);
  }

  protected async spawnAndWaitAndStopIfError(...args: Parameters<typeof spawnAndWait>) {
    const childProcess = await spawnAndWait(...args);
    if (childProcess.exitCode) {
      process.exit(childProcess.exitCode);
    }
  }

  protected shouldIncludeFile(filePath: string) {
    const isIgnoredDirectory = this.ignoredDirectories.some((dir) => filePath.includes(dir));
    const isIgnoredFile = this.ignoredFiles.some((file) => filePath.endsWith(file));
    return !isIgnoredDirectory && !isIgnoredFile && !filePath.includes(this.templatePath);
  }

  protected getChangedFileType(path: string): 'content' | 'assets' {
    if (path.endsWith('.md')) {
      return 'content';
    } else {
      return 'assets';
    }
  }

  protected async createGitIgnoreFile() {
    const itemsToIgnore = [this.getRc((rc) => rc?.outDir)];
    await addToGitIgnore(this.workingDirectory, itemsToIgnore);
  }

  protected async cloneAndInstallTemplate() {
    await this.cloneRepository();
    console.log(chalk.green('Successfully Cloned Template'));
    await this.spawnAndWaitAndStopIfError('npm', ['install'], {
      cwd: this.templatePath,
    });
    console.log(chalk.green('Successfully Installed Dependencies'));
  }

  protected async cloneRepository() {
    const outDir = this.getRc((rc) => rc?.outDir);
    const templateRepository = this.getRc((rc) => rc?.template?.repository);
    const branchName = this.getRc((rc) => rc?.template?.branch);

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

  protected isFirstRun(templatePath: string) {
    //TOOD: Be more specific about this condition
    return !pathExists(templatePath);
  }

  protected async copyAssetsAndContentFilesToTemplate() {
    const createDirectoryPromises = [];
    if (!pathExists(this.templateContentPath)) {
      createDirectoryPromises.push(createDirectory(this.templateContentPath));
    }

    if (!pathExists(this.templateAssetsPath)) {
      createDirectoryPromises.push(createDirectory(this.templateAssetsPath));
    }

    await Promise.all(createDirectoryPromises);

    return await Promise.all([
      copyAllFilesFromOneDirectoryToAnother(
        this.workingDirectory,
        this.templateContentPath,
        (filePath) =>
          this.shouldIncludeFile(filePath) && this.getChangedFileType(filePath) === 'content',
      ),
      copyAllFilesFromOneDirectoryToAnother(
        this.workingDirectory,
        this.templateAssetsPath,
        (filePath) =>
          this.shouldIncludeFile(filePath) && this.getChangedFileType(filePath) === 'assets',
      ),
    ]);
  }
}
