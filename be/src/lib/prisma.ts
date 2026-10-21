import { PrismaClient } from '@prisma/client';

const prismaGlobal = globalThis as typeof globalThis & { prisma?: PrismaClient };
export const prisma = prismaGlobal.prisma ?? new PrismaClient();
prismaGlobal.prisma = prisma;
