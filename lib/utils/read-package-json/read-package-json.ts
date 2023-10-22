import { join } from 'path';
import { readFileSync, promises } from 'fs';

export const readPackageJsonSync = () => {
  return JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
};

export const readPackageJson = async () => {
  return JSON.parse(
    await promises.readFile(join(process.cwd(), 'package.json'), 'utf8'),
  );
};
