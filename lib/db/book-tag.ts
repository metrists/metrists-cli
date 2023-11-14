import { PrismaClient, type book_tags } from '@prisma/client';

const prisma = new PrismaClient();

export const createBookTag = async (
  tagData: Omit<book_tags, 'created_at' | 'id'>,
) => {
  return await prisma.book_tags.create({ data: tagData });
};

export const getBookTag = async (tagData: Partial<book_tags>) => {
  return await prisma.book_tags.findFirst({ where: tagData });
};

export const getAllBookTags = async () => {
  return await prisma.book_tags.findMany();
};

export const updateBookTag = async (
  tagToFind: Partial<book_tags>,
  tagData: book_tags,
) => {
  return await prisma.book_tags.updateMany({ where: tagToFind, data: tagData });
};

export const deleteBookTag = async (tagToFind: Partial<book_tags>) => {
  return await prisma.book_tags.deleteMany({ where: tagToFind });
};

export const deleteAllBookTags = async () => {
  return await prisma.book_tags.deleteMany();
};
