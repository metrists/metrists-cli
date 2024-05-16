import { join, resolve } from 'path';
import {
  readFile as readFileFs,
  readdir,
  copyFile as copyFileFs,
  mkdir,
  unlink,
  appendFile,
} from 'fs/promises';
import { existsSync } from 'fs';
import { EOL } from 'os';

export async function readFile<TData = any>(...paths: string[]) {
  const finalPath = combinePaths(paths);
  return JSON.parse(await readFileFs(finalPath, { encoding: 'utf8' })) as TData;
}

export async function readFileInLines(...params: Parameters<typeof readFile>) {
  const fileContent = await readFile<string>(...params);
  return fileContent.split(EOL);
}

export async function readFileIfExists<TData = any>(...paths: string[]) {
  const finalPath = combinePaths(paths);
  if (existsSync(finalPath)) {
    return readFile(finalPath) as Promise<TData>;
  }

  return null;
}

export async function appendToFile(filePath: string, data: string | string[] | Buffer) {
  if (Array.isArray(data)) {
    return await appendFile(filePath, data.join(EOL));
  } else {
    return await appendFile(filePath, data);
  }
}

export function combinePaths(paths: string[]) {
  return paths.reduce((finalPath, currentPortion) => join(finalPath, currentPortion), '');
}

export async function* getContentsRecursively(dir: string) {
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

export function copyAllFilesFromOneDirectoryToAnother(
  directoryToLookAt: string,
  outputDirectory: string,
  shouldInclude: (filePath: string) => boolean,
) {
  const allFilesPromises = [];
  performOnAllFilesInDirectory(directoryToLookAt, async (file) => {
    if (shouldInclude(file)) {
      const relativePath = file.replace(directoryToLookAt, '');
      const outputPath = join(outputDirectory, relativePath);
      allFilesPromises.push(copyFile(file, outputPath));
    }
  });

  return Promise.all(allFilesPromises);
}

export async function performOnAllFilesInDirectory(
  directoryPath: string,
  cb: (filePath: string) => Promise<void>,
) {
  const resultPromises = [];
  for await (const file of getContentsRecursively(directoryPath)) {
    resultPromises.push(cb(file));
  }
  return Promise.all(resultPromises);
}

export async function createDirectory(directoryPath: string) {
  return await mkdir(directoryPath, { recursive: true });
}

export async function createDirectoryIfNotExists(directoryPath: string) {
  if (!pathExists(directoryPath)) {
    return await createDirectory(directoryPath);
  }
}

export async function createFile(filePath: string, fileContent?: string | Buffer) {
  return await appendFile(filePath, fileContent ?? '');
}

export async function createFileIfNotExists(filePath: string) {
  if (!pathExists(filePath)) {
    return await createFile(filePath);
  }
}

export function pathExists(path: string) {
  return existsSync(path);
}

export async function copyFile(fromPath: string, toPath: string) {
  return await copyFileFs(fromPath, toPath);
}

export async function deleteFile(path: string) {
  return await unlink(path);
}
