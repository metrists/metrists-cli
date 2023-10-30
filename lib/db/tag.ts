import { PrismaClient, type tags } from '@prisma/client';

const prisma = new PrismaClient();

export const createTag = async (tagData: tags) => {
  return await prisma.tags.create({ data: tagData });
};

export const getTag = async (tagData: Partial<tags>) => {
  return await prisma.tags.findFirst({ where: tagData });
};

export const getAllTags = async () => {
  return await prisma.tags.findMany();
};

export const updateTag = async (tagToFind: Partial<tags>, tagData: tags) => {
  return await prisma.tags.updateMany({ where: tagToFind, data: tagData });
};

export const deleteTag = async (tagToFind: Partial<tags>) => {
  return await prisma.tags.deleteMany({ where: tagToFind });
};
