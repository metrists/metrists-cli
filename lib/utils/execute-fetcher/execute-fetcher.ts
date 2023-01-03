import childProcess = require('child_process');

export const executeFetcher = (fetcher: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = childProcess.spawn('npx', [`tsx`, fetcher]);
    child.stdout.on('data', (buffer) => resolve(buffer.toString()));
    child.stdout.on('error', reject);
  });
