import { createBook } from '../../db/book';
import { createFile } from '../../db/file';
import { createAuthor, getAuthor } from '../../db/author';
import { createTag, getTag } from '../../db/tag';
import { createEdition } from '../../db/edition';
import { createBookTag } from '../../db/book-tag';
import { createAuthorBook } from '../../db/author-book';
import type { ParsedBook } from '../parse-rdf/parse-rdf';
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
  const createdBook = await createBook({
    cover_file_id: cover?.id,
    description: bookData.description ?? '',
    published_at: bookData.published ? new Date(bookData.published) : null,
    title: bookData.title,
    reference: bookData.slug,
    updated_at: new Date(),
  });

  const createdAuthors = await Promise.all(
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

  await Promise.all(
    createdAuthors.map(async (createdAuthor) =>
      createAuthorBook({
        book_id: createdBook.id,
        profile_id: createdAuthor.id,
      }),
    ),
  );

  const createdTags = [];
  for (const currentPrimaryTag of tags) {
    const secondaryTags =
      tagDefinitions[currentPrimaryTag.name.toLowerCase().trim()];
    if (secondaryTags?.length) {
      for (const secondaryTag of secondaryTags) {
        const formattedSecondaryTag = {
          name: secondaryTag.toLowerCase().trim(),
          id: secondaryTag.toLowerCase().trim().replace(/\s+/g, '-'),
        };

        const preExistingTag = await getTag({
          reference: formattedSecondaryTag.id,
        });

        if (preExistingTag) {
          createdTags.push(preExistingTag);
        } else {
          createdTags.push(
            await createTag({
              reference: formattedSecondaryTag.id,
              title: formattedSecondaryTag.name,
              updated_at: new Date(),
            }),
          );
        }
      }
    }
  }

  await Promise.all(
    createdTags.map(
      async (createdTag) =>
        await createBookTag({
          book_id: createdBook.id,
          tag_id: createdTag.id,
        }),
    ),
  );

  const createdEdition = await createEdition({
    book_id: createdBook.id,
    locale: bookData.language,
    updated_at: new Date(),
    publicized_at: new Date(),
  });

  return { createdBook, createdAuthors, createdTags, createdEdition };
};
