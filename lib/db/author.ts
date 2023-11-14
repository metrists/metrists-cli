import { PrismaClient, type profiles } from '@prisma/client';

const prisma = new PrismaClient();

export const createAuthor = async (
  authorData: Omit<profiles, 'id' | 'created_at' | 'user_id'>,
) => {
  return await prisma.profiles.create({ data: authorData });
};

export const getAuthor = async (authorData: Partial<profiles>) => {
  return await prisma.profiles.findFirst({ where: authorData });
};

export const getAllAuthors = async () => {
  return await prisma.profiles.findMany();
};

export const updateAuthor = async (
  authorToFind: Partial<profiles>,
  authorData: profiles,
) => {
  return await prisma.profiles.updateMany({
    where: authorToFind,
    data: authorData,
  });
};

export const deleteAuthor = async (authorToFind: Partial<profiles>) => {
  return await prisma.profiles.deleteMany({ where: authorToFind });
};

export const deleteAllAuthors = async () => {
  return await prisma.profiles.deleteMany();
};
