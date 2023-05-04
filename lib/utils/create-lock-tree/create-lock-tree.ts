import { join, resolve } from 'path';
import { promises } from 'fs';

const readFile = promises.readFile;
const readDir = promises.readdir;
const stat = promises.stat;

export const createLockTree = async (resolvePath: string) => {
  return await createTreeLevel(resolvePath);
};

export const createTreeLevel = async (resolvePath: string, level = 0) => {
  const items = await readDir(resolvePath);

  const results = {};

  for (const item of items) {
    const itemPath = join(resolvePath, item);
    const itemStat = await stat(itemPath);
    if (itemStat.isDirectory()) {
      const levelBelowResults = await createTreeLevel(itemPath, level + 1);
      Object.assign(results, levelBelowResults);
    } else {
      const fileValues = JSON.parse(
        await readFile(itemPath, { encoding: 'utf8' }),
      );
      results[`${join(resolvePath, item).replace('.json', '')}`] = fileValues;
    }
  }

  return results;
};
