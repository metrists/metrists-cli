import { CommanderStatic, Command } from 'commander';
import { ConfigAwareCommand } from './config-aware.command';
import { join } from 'path';
import { spawn } from 'child_process';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as chalk from 'chalk';
import { watch } from 'chokidar';

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
    const templatePath = join(process.cwd(), outDir);
    const templateRepository = this.getConfig((rc) => rc?.template?.repository);

    const templateFilesPath = this.getConfig((rc) => rc?.template?.filesPath);
    const templateOutputPath = join(templatePath, templateFilesPath);

    await this.createOutputDirectoryIfNotExists(templatePath, templateRepository, outDir);

    const devProcess = await this.startDevServer(templatePath);
    this.watchFiles(process.cwd(), async (event, path) => {
      if (path.startsWith(join(process.cwd(), outDir))) {
        return;
      }
      const filePathRelativeToRootWithFileName = path.replace(process.cwd(), '');
      const filePathRelativeToRoot = filePathRelativeToRootWithFileName.substring(
        0,
        filePathRelativeToRootWithFileName.lastIndexOf('/'),
      );
      const pathTheFileNeedsToCopyInto = join(templateOutputPath, filePathRelativeToRoot);
      const finalFilePath = join(templateOutputPath, filePathRelativeToRootWithFileName);

      console.log({
        filePathRelativeToRootWithFileName,
        filePathRelativeToRoot,
        pathTheFileNeedsToCopyInto,
        finalFilePath,
      });

      await this.createDirectoryIfNotExists(pathTheFileNeedsToCopyInto);
      await this.copyFile(path, finalFilePath);
    });
  }

  protected async startDevServer(outputPath) {
    return new Promise((resolve, reject) => {
      const devServerProcess = spawn('npm', ['run', 'dev'], { cwd: outputPath });
      devServerProcess.stdout.on('data', (data) => {
        console.log(chalk.green(data.toString()));
      });
      devServerProcess.stderr.on('data', (data) => {
        console.log(chalk.red(data.toString()));
      });
      devServerProcess.on('close', async (code) => {
        if (code === 0) {
          console.log(chalk.green('Started the development server successfully'));
        }
      });
      resolve(devServerProcess);
    });
  }

  protected async createOutputDirectoryIfNotExists(
    outputPath: string,
    templateRepository: string,
    outDir: string,
  ) {
    return new Promise(async (resolve, reject) => {
      if (!this.pathExists(outputPath)) {
        //Clone the git repository, install the dependencies and return the process so that it can be terminated when the watch mode is stopped
        console.log(chalk.green('Cloning the repository...'));
        const cloneProcess = spawn('git', ['clone', templateRepository, outDir]);
        cloneProcess.stdout.on('data', (data) => {
          console.log(chalk.green(data.toString()));
        });
        cloneProcess.stderr.on('data', (data) => {
          console.log(chalk.red(data.toString()));
        });
        cloneProcess.on('close', async (code) => {
          if (code === 0) {
            console.log(chalk.green('Cloned the repository successfully'));
            console.log(chalk.green('Installing the dependencies...'));
            const installProcess = spawn('npm', ['install'], { cwd: outDir });
            installProcess.stdout.on('data', (data) => {
              console.log(chalk.green(data.toString()));
            });
            installProcess.stderr.on('data', (data) => {
              console.log(chalk.red(data.toString()));
              reject(1);
            });
            installProcess.on('close', async (code) => {
              if (code === 0) {
                console.log(chalk.green('Installed the dependencies successfully'));
                resolve(0);
              } else {
                reject(1);
              }
            });
          }
        });
      } else {
        resolve(0);
      }
    });
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
      this.displayBanner();
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
