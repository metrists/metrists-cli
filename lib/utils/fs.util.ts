import { join, resolve } from 'path';
import { readFile as readFileFs, readdir } from 'fs/promises';
import { existsSync } from 'fs';

export async function readFile<TData = any>(...paths: string[]) {
  const finalPath = combinePaths(paths);
  return JSON.parse(await readFileFs(finalPath, { encoding: 'utf8' })) as TData;
}

export async function readFileIfExists<TData = any>(...paths: string[]) {
  const finalPath = combinePaths(paths);
  if (existsSync(finalPath)) {
    return readFile(finalPath);
  }

  return null;
}

function combinePaths(paths: string[]) {
  return paths.reduce((finalPath, currentPortion) => join(finalPath, currentPortion), '');
}

export async function* getContentsRecursively(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getContentsRecursively(res);
    } else {
      yield res;
    }
  }
}
