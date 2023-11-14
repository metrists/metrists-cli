import { ParsedBook } from '@lib/utils/parse-rdf/parse-rdf';
import { MongoClient, Collection, ObjectId } from 'mongodb';

export interface Book extends Partial<Omit<ParsedBook, 'authors' | 'tags'>> {
  _id?: ObjectId;
  errors?: string[];
  status:
    | 'entities_pending'
    | 'entities_completed'
    | 'files_pending'
    | 'files_downloaded'
    | 'completed'
    | 'failed';
  authors?: Author[];
  tags?: Tag[];
  reference?: string;
}

interface Tag {
  _id?: ObjectId;
  name: string;
  reference?: string;
}

interface Author {
  _id?: ObjectId;
  name: string;
  username?: string;
}

interface Cache {
  _id?: ObjectId;
  key: string;
  value: string;
}

interface Context {
  books: Collection<Book>;
  cache: Collection<Cache>;
}

const uri = process.env.CONTEXT_DB_URL!;

class ContextSingleton {
  private static instance: Context | null = null;

  static async getInstance(): Promise<Context> {
    if (!ContextSingleton.instance) {
      const client = new MongoClient(uri);
      await client.connect();
      const database = client.db('mydatabase');
      const books = database.collection<Book>('books');
      const cache = database.collection<Cache>('cache');

      ContextSingleton.instance = { books, cache };
    }
    return ContextSingleton.instance;
  }
}

export async function createContext(): Promise<Context> {
  return ContextSingleton.getInstance();
}

export async function clearContext() {
  const context = await ContextSingleton.getInstance();
  await context.books.deleteMany({});
  await context.cache.deleteMany({});
}

export async function createBook(book: Book): Promise<Book> {
  const context = await ContextSingleton.getInstance();

  const result = await context.books.insertOne(book);
  return getBook(result.insertedId);
}

export async function getOrCreateBook(
  book: Omit<Book, 'status'>,
): Promise<Book> {
  const context = await ContextSingleton.getInstance();
  const existingBook = await context.books.findOne({
    id: book.id,
  });
  if (existingBook) {
    return existingBook;
  }
  return await createBook({ status: 'entities_pending', ...book });
}

export async function getBook(id: ObjectId): Promise<Book | null> {
  const context = await ContextSingleton.getInstance();
  return context.books.findOne({ _id: id });
}

export async function updateBook(
  id: ObjectId,
  updates: Partial<Book>,
): Promise<Book | null> {
  const context = await ContextSingleton.getInstance();
  const result = await context.books.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { returnDocument: 'after' },
  );
  return result;
}

export async function deleteBook(id: ObjectId): Promise<boolean> {
  const context = await ContextSingleton.getInstance();
  const result = await context.books.deleteOne({ _id: id });
  return result.deletedCount === 1;
}
export async function addAuthorToBook(
  bookId: ObjectId,
  author: Author,
): Promise<Book | null> {
  const context = await ContextSingleton.getInstance();
  const result = await context.books.findOneAndUpdate(
    { _id: bookId },
    { $push: { authors: author } },
    { returnDocument: 'after' },
  );
  return result;
}

export async function removeAuthorFromBook(
  bookId: ObjectId,
  authorId: ObjectId,
): Promise<Book | null> {
  const context = await ContextSingleton.getInstance();
  const result = await context.books.findOneAndUpdate(
    { _id: bookId },
    { $pull: { 'authors._id': authorId } },
    { returnDocument: 'after' },
  );
  return result;
}

export async function addTagToBook(
  bookId: ObjectId,
  tag: Tag,
): Promise<Book | null> {
  const context = await ContextSingleton.getInstance();
  const result = await context.books.findOneAndUpdate(
    { _id: bookId },
    { $push: { tags: tag } },
    { returnDocument: 'after' },
  );
  return result;
}

export async function removeTagFromBook(
  bookId: ObjectId,
  tagId: ObjectId,
): Promise<Book | null> {
  const context = await ContextSingleton.getInstance();
  const result = await context.books.findOneAndUpdate(
    { _id: bookId },
    { $pull: { 'tags._id': tagId } },
    { returnDocument: 'after' },
  );
  return result;
}

export async function reportError(
  id: ObjectId,
  error: string,
  status?: Book['errors'][0],
): Promise<void> {
  const context = await ContextSingleton.getInstance();
  await context.books.updateOne(
    { _id: id },
    { $push: { errors: error }, ...(status ? { status } : {}) },
  );
}

export async function setCache(key: string, value: string) {
  const context = await ContextSingleton.getInstance();
  await context.cache.updateOne({ key }, { $set: { value } }, { upsert: true });
}

export async function getCache(key: string) {
  const context = await ContextSingleton.getInstance();
  const result = await context.cache.findOne({ key });
  return result?.value;
}
