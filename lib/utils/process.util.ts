import { spawn } from 'child_process';
import { gray } from 'chalk';

export function spawnAndWait(command: string, args: string[], cwd: string) {
  return new Promise((res, rej) => {
    const childProcess = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env },
      shell: true,
      windowsHide: true,
    });

    childProcess.stderr.on('data', (data) => {
      console.error(gray(data.toString()));
    });

    childProcess.stdout.on('data', (data) => {
      console.log(gray(data.toString()));
    });

    childProcess.on('exit', (code) => {
      if (code !== 0) {
        rej({ code: code });
      } else {
        res({ code: 0 });
      }
    });
  });
}
