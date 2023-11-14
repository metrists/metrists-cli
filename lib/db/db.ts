import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
if (!prisma) {
  prisma = new PrismaClient();
}
prisma.$connect();

function getIsDbLocal() {
  const connectionString = process.env.DATABASE_URL;
  return connectionString?.includes('localhost');
}

export { prisma, getIsDbLocal };
