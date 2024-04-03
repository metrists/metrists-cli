import { spawn, type ChildProcess } from 'child_process';
import { gray } from 'chalk';

type SpawnParams = Parameters<typeof spawn>;

export async function spawnAndWait(
  command: SpawnParams[0],
  args: SpawnParams[1],
  cwd: Partial<SpawnParams[2]> = {},
): Promise<ChildProcess> {
  const childProcess = spawn(command, args, {
    env: { ...process.env },
    shell: true,
    windowsHide: true,
    ...cwd,
  });

  childProcess.stderr.on('data', (data) => {
    console.error(gray(data.toString()));
  });

  childProcess.stdout.on('data', (data) => {
    console.log(gray(data.toString()));
  });

  return new Promise<ChildProcess>(async (res, rej) => {
    childProcess.on('exit', (code) => {
      if (code !== 0) {
        rej(childProcess);
      } else {
        res(childProcess);
      }
    });
  });
}
