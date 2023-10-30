import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
if (!prisma) {
  prisma = new PrismaClient();
}
prisma.$connect();

export { prisma };
