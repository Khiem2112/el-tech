import { prisma } from '../lib/prisma.js';

export const catalogService = {
  async getCategories(): Promise<readonly { id: number; parentId: number | null; name: string; slug: string; description: string | null }[]> {
    return prisma.category.findMany({ where: { isActive: true }, select: { id: true, parentId: true, name: true, slug: true, description: true }, orderBy: [{ parentId: 'asc' }, { name: 'asc' }] });
  },
  async getBranches(): Promise<readonly { id: number; code: string; name: string; address: string; openingHour: unknown }[]> {
    return prisma.branch.findMany({ where: { isActive: true }, select: { id: true, code: true, name: true, address: true, openingHour: true }, orderBy: { deliveryPriority: 'asc' } });
  },
};
