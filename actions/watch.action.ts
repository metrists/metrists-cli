import { join } from 'path';
import { spawn } from 'child_process';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { watch } from 'chokidar';

const OUTDIR = '.metrists';
const OUT_REPOSITORY = 'https://github.com/one-aalam/remix-ink';
const OUT_REPOSITORY_FILES_PATH = '/contents/posts/';

export class WatchAction extends AbstractAction {
  public async handle({ options }) {
    const outputPath = join(process.cwd(), OUTDIR);
    await this.createOutputDirectoryIfNotExists(outputPath);
    const outputFilesPath = join(outputPath, OUT_REPOSITORY_FILES_PATH);
    await spawn('rsync', ['a', '--exclude', outputPath, process.cwd(), outputFilesPath], {
      cwd: process.cwd(),
    });
    const devProcess = await this.startDevServer(outputPath);
    // this.watchFiles(process.cwd(), async (event, path) => {
    //   if (path.startsWith(join(process.cwd(), OUTDIR))) {
    //     return;
    //   }
    //   const relativePath = path.replace(process.cwd(), '');
    //   const outputPathToProject = join(OUTDIR, relativePath);
    //   const outputPath = join(outputPathToProject, OUT_REPOSITORY_FILES_PATH);
    //   await this.createOutputDirectoryIfNotExists(outputPath);
    //   await this.copyFile(path, join(OUTDIR, relativePath));
    // });
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

  protected async createOutputDirectoryIfNotExists(outputPath: string) {
    if (!this.pathExists(outputPath)) {
      //Clone the git repository, install the dependencies and return the process so that it can be terminated when the watch mode is stopped
      console.log(chalk.green('Cloning the repository...'));
      const cloneProcess = spawn('git', ['clone', OUT_REPOSITORY, OUTDIR]);
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
          const installProcess = spawn('npm', ['install'], { cwd: OUTDIR });
          installProcess.stdout.on('data', (data) => {
            console.log(chalk.green(data.toString()));
          });
          installProcess.stderr.on('data', (data) => {
            console.log(chalk.red(data.toString()));
            throw new Error('Failed to install the dependencies');
          });
          installProcess.on('close', async (code) => {
            if (code === 0) {
              console.log(chalk.green('Installed the dependencies successfully'));
            }
          });
        }
      });
    }
  }

  protected async createDirectory(directoryPath: string) {
    return await mkdir(directoryPath, { recursive: true });
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
