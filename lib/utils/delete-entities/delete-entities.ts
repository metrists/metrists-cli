import { deleteAllBooks } from '../../db/book';
import { deleteAllAuthorBooks } from '../../db/author-book';
import { deleteAllTags } from '../../db/tag';
import { deleteAllBookTags } from '../../db/book-tag';
import { deleteAllFiles } from '../../db/file';
import { deleteAllAuthors } from '../../db/author';
import { deleteAllEditions } from '../../db/edition';

export const deleteAllEntities = async () => {
  await deleteAllAuthorBooks();
  await deleteAllBookTags();
  await deleteAllEditions();
  await deleteAllFiles();
  await deleteAllBooks();
  await deleteAllAuthors();
  await deleteAllTags();
};
