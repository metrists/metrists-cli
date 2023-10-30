import { PrismaClient, type books } from '@prisma/client';

const prisma = new PrismaClient();

export const createBook = async (book: books) => {
  return await prisma.books.create({ data: book });
};

export const getBook = async (book: Partial<books>) => {
  return await prisma.books.findFirst({ where: book });
};

export const getAllBooks = async () => {
  return await prisma.books.findMany();
};

export const updateBook = async (bookToFind: Partial<books>, book: books) => {
  return await prisma.books.updateMany({ where: bookToFind, data: book });
};

export const deleteBook = async (bookToFind: Partial<books>) => {
  return await prisma.books.deleteMany({ where: bookToFind });
};