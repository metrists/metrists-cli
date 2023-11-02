import { PrismaClient, type editions } from '@prisma/client';

const prisma = new PrismaClient();

export const createEdition = async (
  editionData: Omit<editions, 'created_at' | 'id'>,
) => {
  return await prisma.editions.create({ data: editionData });
};

export const getEdition = async (editionData: Partial<editions>) => {
  return await prisma.editions.findFirst({ where: editionData });
};

export const getAllEditions = async () => {
  return await prisma.editions.findMany();
};

export const updateEditions = async (
  editionToFind: Partial<editions>,
  editionData: editions,
) => {
  return await prisma.editions.updateMany({
    where: editionToFind,
    data: editionData,
  });
};

export const deleteEditions = async (editionToFind: Partial<editions>) => {
  return await prisma.editions.deleteMany({ where: editionToFind });
};
