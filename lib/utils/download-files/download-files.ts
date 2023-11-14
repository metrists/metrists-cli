import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import {
  type Book,
  updateBook as updateBookContext,
  getCache,
} from '../../../context/context';
import { getAuthorCacheKey } from '../create-entities/create-entities';
import { FileCreationException } from '../../../exceptions/file-creation.exception';
import { AuthorNotSavedException } from '../../../exceptions/author-not-saved.exception';
import type { ParsedBook } from '../parse-rdf/parse-rdf';

export async function downloadFiles(
  basePath: string,
  parsedBook: ParsedBook,
  context: Book,
) {
  context = await updateBookContext(context._id, {
    status: 'files_pending',
  });
  const htmlUrl = parsedBook.htmlUrl;
  const bookDirectory = join(basePath, 'books', context.reference);
  await mkdir(bookDirectory, { recursive: true });

  const htmlPath = await downloadFileToPath(
    htmlUrl,
    join(bookDirectory, 'index.html'),
  );
  const coverPath = await downloadFileToPath(
    parsedBook.coverUrl,
    join(bookDirectory, 'cover.jpg'),
  );

  const authorDirectory = join(basePath, 'authors');
  await mkdir(authorDirectory, { recursive: true });

  const authorPaths = await Promise.all(
    parsedBook.authors.map(async (author) => {
      const authorUsernameCacheKey = getAuthorCacheKey(author);
      const authorUsernameCache = await getCache(authorUsernameCacheKey);
      if (!authorUsernameCache) {
        throw new AuthorNotSavedException({
          author: author.wikipedia ?? author.name,
        });
      }
      const authorCacheKey = `file-author-${author.id}${
        author.dob ? `-${author.dob}` : ''
      }`;
      const authorCache = await getCache(authorCacheKey);
      if (authorCache) {
        return;
      }

      const originalFileFormat = author.avatarUrl.split('.').pop();

      const authorPath = join(authorDirectory, `${authorUsernameCache}`);
      await mkdir(authorPath, { recursive: true });
      //Save the avatar file to the author directory
      return await downloadFileToPath(
        author.avatarUrl,
        join(authorPath, `avatar.${originalFileFormat}`),
      );
    }),
  );

  context = await updateBookContext(context._id, {
    status: 'files_downloaded',
  });

  return { htmlPath, coverPath, authorPaths };
}

async function downloadFileToPath(url: string, path: string) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await writeFile(path, Buffer.from(buffer));
    return path;
  } catch (e) {
    throw new FileCreationException({
      path,
      error: e.message,
    });
  }
}
