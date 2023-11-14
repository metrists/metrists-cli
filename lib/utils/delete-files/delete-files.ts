import { join } from 'path';
import { rm } from 'fs/promises';

export async function deleteFiles(basePath: string) {
  const authorsPath = join(basePath, 'authors');

  await rm(authorsPath, { recursive: true });

  const booksPath = join(basePath, 'books');

  await rm(booksPath, { recursive: true });
}
