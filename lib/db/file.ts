import { PrismaClient, type files } from '@prisma/client';

const prisma = new PrismaClient();

export const createFile = async (fileData: files) => {
  return await prisma.files.create({ data: fileData });
};

export const getFile = async (fileData: Partial<files>) => {
  return await prisma.files.findFirst({ where: fileData });
};

export const getAllFiles = async () => {
  return await prisma.files.findMany();
};

export const updateFile = async (
  fileToFind: Partial<files>,
  fileData: files,
) => {
  return await prisma.files.updateMany({
    where: fileToFind,
    data: fileData,
  });
};

export const deleteFile = async (fileToFind: Partial<files>) => {
  return await prisma.files.deleteMany({ where: fileToFind });
};
