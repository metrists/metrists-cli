import { PrismaClient, type profile_books } from '@prisma/client';

const prisma = new PrismaClient();

export const createAuthorBook = async (
  tagData: Omit<profile_books, 'created_at' | 'id'>,
) => {
  return await prisma.profile_books.create({ data: tagData });
};

export const getAuthorBook = async (tagData: Partial<profile_books>) => {
  return await prisma.profile_books.findFirst({ where: tagData });
};

export const getAllAuthorBooks = async () => {
  return await prisma.profile_books.findMany();
};

export const updateAuthorBook = async (
  tagToFind: Partial<profile_books>,
  tagData: profile_books,
) => {
  return await prisma.profile_books.updateMany({
    where: tagToFind,
    data: tagData,
  });
};

export const deleteAuthorBook = async (tagToFind: Partial<profile_books>) => {
  return await prisma.profile_books.deleteMany({ where: tagToFind });
};

export const deleteAllAuthorBooks = async () => {
  return await prisma.profile_books.deleteMany();
};
