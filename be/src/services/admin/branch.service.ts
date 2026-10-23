import { Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateBranchInput,
  QueryBranchInput,
  UpdateBranchInput,
} from '../../validations/admin/branch.schema.js';

export type BranchDto = {
  id: number;
  code: string;
  name: string;
  address: string;
  openingHour: unknown;
  deliveryPriority: number;
  deliveryAreaCodes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BranchListResponse = {
  items: BranchDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function formatOpeningHourPayload(
  rawOpeningHour?: unknown,
  phone?: string,
  email?: string,
  currentOpeningHour?: unknown,
): Prisma.InputJsonValue {
  let baseObj: Record<string, unknown> = {};

  if (currentOpeningHour && typeof currentOpeningHour === 'object' && !Array.isArray(currentOpeningHour)) {
    baseObj = { ...(currentOpeningHour as Record<string, unknown>) };
  }

  if (typeof rawOpeningHour === 'string') {
    baseObj.display = rawOpeningHour;
  } else if (rawOpeningHour && typeof rawOpeningHour === 'object' && !Array.isArray(rawOpeningHour)) {
    baseObj = { ...baseObj, ...(rawOpeningHour as Record<string, unknown>) };
  }

  if (phone !== undefined) {
    baseObj.phone = phone;
  }
  if (email !== undefined) {
    baseObj.email = email;
  }

  return baseObj as Prisma.InputJsonValue;
}

export class AdminBranchService {
  async getBranches(query: QueryBranchInput): Promise<BranchListResponse> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, Math.min(100, query.limit));
    const skip = (page - 1) * limit;

    const where: Prisma.BranchWhereInput = {};

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        orderBy: [{ deliveryPriority: 'asc' }, { id: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.branch.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getBranchById(id: number): Promise<BranchDto> {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new DomainError('BRANCH_NOT_FOUND', {
        status: 404,
        messageKey: 'error.branchNotFound',
        details: { id },
      });
    }

    return branch;
  }

  async createBranch(input: CreateBranchInput): Promise<BranchDto> {
    const existing = await prisma.branch.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      throw new DomainError('BRANCH_CODE_EXISTS', {
        status: 409,
        messageKey: 'error.branchCodeExists',
        details: { code: input.code },
      });
    }

    const openingHour = formatOpeningHourPayload(
      input.openingHour,
      input.phone,
      input.email,
    );

    const branch = await prisma.branch.create({
      data: {
        code: input.code,
        name: input.name,
        address: input.address,
        openingHour,
        deliveryPriority: input.deliveryPriority,
        deliveryAreaCodes: input.deliveryAreaCodes,
        isActive: input.isActive,
      },
    });

    return branch;
  }

  async updateBranch(id: number, input: UpdateBranchInput): Promise<BranchDto> {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new DomainError('BRANCH_NOT_FOUND', {
        status: 404,
        messageKey: 'error.branchNotFound',
        details: { id },
      });
    }

    if (input.code && input.code !== branch.code) {
      const conflict = await prisma.branch.findUnique({
        where: { code: input.code },
      });

      if (conflict) {
        throw new DomainError('BRANCH_CODE_EXISTS', {
          status: 409,
          messageKey: 'error.branchCodeExists',
          details: { code: input.code },
        });
      }
    }

    const data: Prisma.BranchUpdateInput = {};

    if (input.code !== undefined) {
      data.code = input.code;
    }
    if (input.name !== undefined) {
      data.name = input.name;
    }
    if (input.address !== undefined) {
      data.address = input.address;
    }
    if (input.deliveryPriority !== undefined) {
      data.deliveryPriority = input.deliveryPriority;
    }
    if (input.deliveryAreaCodes !== undefined) {
      data.deliveryAreaCodes = input.deliveryAreaCodes;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    if (
      input.openingHour !== undefined ||
      input.phone !== undefined ||
      input.email !== undefined
    ) {
      data.openingHour = formatOpeningHourPayload(
        input.openingHour,
        input.phone,
        input.email,
        branch.openingHour,
      );
    }

    const updated = await prisma.branch.update({
      where: { id },
      data,
    });

    return updated;
  }

  async toggleBranchStatus(id: number): Promise<BranchDto> {
    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new DomainError('BRANCH_NOT_FOUND', {
        status: 404,
        messageKey: 'error.branchNotFound',
        details: { id },
      });
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        isActive: !branch.isActive,
      },
    });

    return updated;
  }
}

export const adminBranchService = new AdminBranchService();
