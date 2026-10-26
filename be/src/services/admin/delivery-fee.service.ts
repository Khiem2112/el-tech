import { DeliveryFeeConfig, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  CreateDeliveryFeeInput,
  QueryDeliveryFeeInput,
} from '../../validations/admin/delivery-fee.schema.js';

export type DeliveryFeeStatus = 'ACTIVE' | 'EXPIRED' | 'UPCOMING';

export type DeliveryFeeConfigDto = {
  readonly id: string;
  readonly fixedFee: number;
  readonly freeShippingThreshold: number;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly isActive: boolean;
  readonly status: DeliveryFeeStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DeliveryFeeListResult = {
  readonly active: DeliveryFeeConfigDto | null;
  readonly history: readonly DeliveryFeeConfigDto[];
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
};

function computeStatus(config: DeliveryFeeConfig, now: Date): DeliveryFeeStatus {
  if (!config.isActive) {
    return 'EXPIRED';
  }
  if (config.effectiveTo && config.effectiveTo <= now) {
    return 'EXPIRED';
  }
  if (config.effectiveFrom > now) {
    return 'UPCOMING';
  }
  return 'ACTIVE';
}

function mapToDto(config: DeliveryFeeConfig, creatorName = 'Admin Hệ Thống'): DeliveryFeeConfigDto {
  const now = new Date();
  return {
    id: config.id,
    fixedFee: config.fixedFee.toNumber(),
    freeShippingThreshold: config.freeShippingThreshold.toNumber(),
    effectiveFrom: config.effectiveFrom.toISOString(),
    effectiveTo: config.effectiveTo ? config.effectiveTo.toISOString() : null,
    isActive: config.isActive,
    status: computeStatus(config, now),
    createdBy: creatorName,
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  };
}

export const adminDeliveryFeeService = {
  async ensureDefaultConfig(): Promise<DeliveryFeeConfig> {
    const now = new Date();
    const existing = await prisma.deliveryFeeConfig.findFirst({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (existing) {
      return existing;
    }

    const count = await prisma.deliveryFeeConfig.count();
    if (count > 0) {
      const latest = await prisma.deliveryFeeConfig.findFirst({
        where: {
          isActive: true,
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
        },
        orderBy: { effectiveFrom: 'desc' },
      });
      if (latest) {
        return latest;
      }
    }

    return prisma.deliveryFeeConfig.create({
      data: {
        fixedFee: new Prisma.Decimal(50000),
        freeShippingThreshold: new Prisma.Decimal(5000000),
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
        isActive: true,
      },
    });
  },

  async getActiveConfig(): Promise<DeliveryFeeConfigDto | null> {
    await this.ensureDefaultConfig();
    const now = new Date();
    const active = await prisma.deliveryFeeConfig.findFirst({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (active) {
      return mapToDto(active);
    }

    const fallback = await prisma.deliveryFeeConfig.findFirst({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    return fallback ? mapToDto(fallback) : null;
  },

  async getDeliveryFeeConfigs(query?: QueryDeliveryFeeInput): Promise<DeliveryFeeListResult> {
    await this.ensureDefaultConfig();
    const activeConfig = await this.getActiveConfig();
    const now = new Date();

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;
    const status = query?.status ?? 'ALL';

    let where: Prisma.DeliveryFeeConfigWhereInput = {};
    if (status === 'ACTIVE') {
      where = {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      };
    } else if (status === 'UPCOMING') {
      where = {
        isActive: true,
        effectiveFrom: { gt: now },
      };
    } else if (status === 'EXPIRED') {
      where = {
        OR: [{ isActive: false }, { effectiveTo: { lte: now } }],
      };
    }

    const [total, records] = await Promise.all([
      prisma.deliveryFeeConfig.count({ where }),
      prisma.deliveryFeeConfig.findMany({
        where,
        skip,
        take: limit,
        orderBy: { effectiveFrom: 'desc' },
      }),
    ]);

    const historyDtos = records.map((record) => mapToDto(record));

    return {
      active: activeConfig,
      history: historyDtos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async createDeliveryFeeConfig(
    input: CreateDeliveryFeeInput,
    creatorEmail = 'Admin Hệ Thống',
  ): Promise<DeliveryFeeConfigDto> {
    const now = new Date();
    const effectiveFromDate = input.effectiveFrom ? new Date(input.effectiveFrom) : now;

    const result = await prisma.$transaction(async (tx) => {
      if (effectiveFromDate <= now) {
        await tx.deliveryFeeConfig.updateMany({
          where: { isActive: true },
          data: {
            isActive: false,
            effectiveTo: effectiveFromDate,
          },
        });
      } else {
        await tx.deliveryFeeConfig.updateMany({
          where: {
            isActive: true,
            effectiveFrom: { lt: effectiveFromDate },
            OR: [{ effectiveTo: null }, { effectiveTo: { gt: effectiveFromDate } }],
          },
          data: {
            effectiveTo: effectiveFromDate,
          },
        });
      }

      return tx.deliveryFeeConfig.create({
        data: {
          fixedFee: new Prisma.Decimal(input.fixedFee),
          freeShippingThreshold: new Prisma.Decimal(input.freeShippingThreshold),
          effectiveFrom: effectiveFromDate,
          effectiveTo: null,
          isActive: true,
        },
      });
    });

    return mapToDto(result, creatorEmail);
  },
};
