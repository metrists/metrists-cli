import { createBook } from '@lib/db/book';
import { createFile } from '@lib/db/file';
import { createAuthor, getAuthor } from '@lib/db/author';
import { createTag, getTag } from '@lib/db/tag';
import { createEdition } from '@lib/db/edition';
import type { ParsedBook, ParsedTag } from '../parse-rdf/parse-rdf';
import { tags } from '@prisma/client';

export const createBookEntities = async (
  book: ParsedBook,
  tagDefinitions: Record<string, string[]>,
) => {
  const { authors, tags, ...bookData } = book;

  const cover = bookData.coverUrl
    ? await createFile({
        bucket: 'covers',
        storage_key: book.id,
        updated_at: new Date(),
      })
    : null;

  //TODO: two books one id ?
  const createdBook = createBook({
    cover_file_id: cover?.id,
    description: bookData.description ?? '',
    published_at: bookData.published ? new Date(bookData.published) : null,
    title: bookData.title,
    reference: bookData.id,
    updated_at: new Date(),
  });

  const createdAuthors = Promise.all(
    authors.map(async (author) => {
      //TODO: two authors one id ?
      const preExistingAuthor = await getAuthor({ username: author.id });

      if (preExistingAuthor) {
        return preExistingAuthor;
      }

      const avatar = author.avatarUrl
        ? await createFile({
            bucket: 'avatars',
            storage_key: author.id,
            updated_at: new Date(),
          })
        : null;

      return createAuthor({
        name: author.name,
        updated_at: new Date(),
        username: author.id,
        bio: author.description ?? '',
        avatar_file_id: avatar?.id,
      });
    }),
  );

  const createdTags = Promise.all(
    tags.reduce((acc, currentPrimaryTag) => {
      const secondaryTags = tagDefinitions[currentPrimaryTag.name];
      if (secondaryTags.length) {
        secondaryTags.forEach(async (secondaryTag) => {
          const formattedSecondaryTag = {
            name: secondaryTag.toLowerCase().trim(),
            id: secondaryTag.toLowerCase().trim().replace(/\s+/g, '-'),
          };

          const preExistingTag = await getTag({
            reference: formattedSecondaryTag.id,
          });

          if (preExistingTag) {
            acc.push(preExistingTag);
          } else {
            acc.push(
              await createTag({
                reference: formattedSecondaryTag.id,
                title: formattedSecondaryTag.name,
                updated_at: new Date(),
              }),
            );
          }
        });
      }

      return acc;
    }, [] as tags[]),
  );

  return { createdBook, createdAuthors, createdTags };
};
