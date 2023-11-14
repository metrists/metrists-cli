import { createBook, updateBook, getBook } from '../../db/book';
import { createFile } from '../../db/file';
import { createAuthor, getAuthor } from '../../db/author';
import { createTag, getTag } from '../../db/tag';
import { createEdition, getEdition } from '../../db/edition';
import { createBookTag, getBookTag } from '../../db/book-tag';
import { createAuthorBook, getAuthorBook } from '../../db/author-book';
import {
  type Book,
  updateBook as updateBookContext,
  setCache,
  getCache,
} from '../../../context/context';
import type { ParsedAuthor, ParsedBook } from '../parse-rdf/parse-rdf';

export const getAuthorCacheKey = (author: ParsedAuthor) =>
  `author-${author.id}${author.dob ? `-${author.dob}` : ''}`;

export const createBookEntities = async (
  book: ParsedBook,
  tagDefinitions: Record<string, string[]>,
  context?: Book,
) => {
  const { authors, tags, ...bookData } = book;

  const reference = addCodeToName(book.slug);

  const cover =
    context.status === 'entities_pending' && bookData.coverUrl
      ? await createFile({
          bucket: 'covers',
          storage_key: reference,
          updated_at: new Date(),
        })
      : null;

  const bookInfoToUpdateOrCreate = {
    description: bookData.description ?? '',
    published_at: bookData.published ? new Date(bookData.published) : null,
    title: bookData.title,
    updated_at: new Date(),
  };

  let createdOrUpdatedBook: Awaited<ReturnType<typeof createBook>> = null;
  const newBook = context.status === 'entities_pending';

  if (newBook) {
    createdOrUpdatedBook = await createBook({
      cover_file_id: cover?.id,
      ...bookInfoToUpdateOrCreate,
      reference: reference,
    });
    updateBookContext(context._id, { ...context, reference });
  } else {
    await updateBook(
      { reference: context.reference },
      bookInfoToUpdateOrCreate,
    );
    createdOrUpdatedBook = await getBook({ reference: context.reference });
  }

  const createdAuthors = await Promise.all(
    authors.map(async (author) => {
      const authorCacheKey = getAuthorCacheKey(author);

      const cachedAuthor = await getCache(authorCacheKey);

      if (cachedAuthor) {
        return await getAuthor({ username: cachedAuthor });
      }

      const authorId = addCodeToName(createUsername(author.name));

      const avatar = author.avatarUrl
        ? await createFile({
            bucket: 'avatars',
            storage_key: author.id,
            updated_at: new Date(),
          })
        : null;

      const createdAuthor = await createAuthor({
        name: author.name,
        updated_at: new Date(),
        username: authorId,
        bio: author.description ?? '',
        avatar_file_id: avatar?.id,
      });

      setCache(authorCacheKey, createdAuthor.username);

      return createdAuthor;
    }),
  );

  await Promise.all(
    createdAuthors.map(async (createdAuthor) => {
      const preExistingAuthorBookRelationship = await getAuthorBook({
        profile_id: createdAuthor.id,
        book_id: createdOrUpdatedBook.id,
      });
      if (!preExistingAuthorBookRelationship) {
        return await createAuthorBook({
          book_id: createdOrUpdatedBook.id,
          profile_id: createdAuthor.id,
        });
      }
      return preExistingAuthorBookRelationship;
    }),
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
    createdTags.map(async (createdTag) => {
      const preExistingTagBookRelationship = await getBookTag({
        book_id: createdOrUpdatedBook.id,
        tag_id: createdTag.id,
      });
      if (!preExistingTagBookRelationship) {
        return await createBookTag({
          book_id: createdOrUpdatedBook.id,
          tag_id: createdTag.id,
        });
      }
      return preExistingTagBookRelationship;
    }),
  );

  let createdEdition: Awaited<ReturnType<typeof createEdition>> = null;
  if (newBook) {
    createdEdition = await createEdition({
      book_id: createdOrUpdatedBook.id,
      locale: bookData.language,
      updated_at: new Date(),
      publicized_at: new Date(),
    });
  } else {
    createdEdition = await getEdition({
      book_id: createdOrUpdatedBook.id,
      locale: bookData.language,
    });
  }

  await updateBookContext(context._id, {
    status: 'entities_completed',
  });

  return {
    createdBook: createdOrUpdatedBook,
    createdAuthors,
    createdTags,
    createdEdition,
  };
};

function addCodeToName(name) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${name}-${code}`;
}

function createUsername(name) {
  const cleanedName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  return cleanedName.toLowerCase().replace(/\s+/g, '-');
}
