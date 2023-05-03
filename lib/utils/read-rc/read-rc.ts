import { join } from 'path';
import { existsSync, readFileSync, promises } from 'fs';
import { RcNotFound } from '../../../exceptions/rc-not-found.exception';

export const readRcSync = async () => {
  const rcPath = join(process.cwd(), '.metristsrc');
  if (existsSync(rcPath)) {
    return JSON.parse(await readFileSync(rcPath, 'utf8'));
  }
  throw new RcNotFound({ file_path: rcPath });
};

export const readRc = async (path?: string) => {
  const rcPath = path ?? join(process.cwd(), '.metristsrc');
  if (existsSync(rcPath)) {
    return JSON.parse(await promises.readFile(rcPath, 'utf8'));
  }
  throw new RcNotFound({ file_path: rcPath });
};
