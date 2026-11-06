import { ComplaintStatus, Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateComplaintInput,
  QueryComplaintsInput,
  UpdateComplaintStatusInput,
} from '../../validations/admin/complaint.schema.js';

export type AdminComplaintItemDto = {
  readonly id: string;
  readonly code: string;
  readonly customerId: string | null;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly customerEmail: string | null;
  readonly orderId: string | null;
  readonly orderCode: string | null;
  readonly serialNumber: string | null;
  readonly category: string;
  readonly status: ComplaintStatus;
  readonly title: string | null;
  readonly description: string;
  readonly resolutionNote: string | null;
  readonly resolvedAt: string | null;
  readonly resolvedBy: string | null;
  readonly attachments: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly customer?: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
  } | null;
  readonly order?: {
    readonly id: string;
    readonly code: string;
    readonly status: string;
    readonly grandTotal: string;
  } | null;
};

export type AdminComplaintStatsDto = {
  readonly total: number;
  readonly received: number;
  readonly processing: number;
  readonly resolved: number;
  readonly dismissed: number;
};

export type AdminComplaintListResultDto = {
  readonly items: readonly AdminComplaintItemDto[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly stats: AdminComplaintStatsDto;
};

function parseAttachments(data: unknown): readonly string[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter((item): item is string => typeof item === 'string');
}

function mapComplaintToDto(complaint: {
  id: string;
  code: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  orderId: string | null;
  orderCode: string | null;
  serialNumber: string | null;
  category: string;
  status: ComplaintStatus;
  title: string | null;
  description: string;
  resolutionNote: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  attachments: unknown;
  createdAt: Date;
  updatedAt: Date;
  customer?: { id: string; name: string; email: string; phone: string } | null;
  order?: { id: string; code: string; status: string; grandTotal: Prisma.Decimal } | null;
}): AdminComplaintItemDto {
  return {
    id: complaint.id,
    code: complaint.code,
    customerId: complaint.customerId,
    customerName: complaint.customerName,
    customerPhone: complaint.customerPhone,
    customerEmail: complaint.customerEmail,
    orderId: complaint.orderId,
    orderCode: complaint.orderCode,
    serialNumber: complaint.serialNumber,
    category: complaint.category,
    status: complaint.status,
    title: complaint.title,
    description: complaint.description,
    resolutionNote: complaint.resolutionNote,
    resolvedAt: complaint.resolvedAt ? complaint.resolvedAt.toISOString() : null,
    resolvedBy: complaint.resolvedBy,
    attachments: parseAttachments(complaint.attachments),
    createdAt: complaint.createdAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
    customer: complaint.customer ?? null,
    order: complaint.order
      ? {
          id: complaint.order.id,
          code: complaint.order.code,
          status: complaint.order.status,
          grandTotal: complaint.order.grandTotal.toString(),
        }
      : null,
  };
}

export class AdminComplaintService {
  async getComplaints(query: QueryComplaintsInput): Promise<AdminComplaintListResultDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {
      isActive: true,
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as ComplaintStatus;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { orderCode: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total, statsGroup] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          order: {
            select: { id: true, code: true, status: true, grandTotal: true },
          },
        },
      }),
      prisma.complaint.count({ where }),
      prisma.complaint.groupBy({
        by: ['status'],
        where: { isActive: true },
        _count: { _all: true },
      }),
    ]);

    const statsMap: Record<ComplaintStatus, number> = {
      RECEIVED: 0,
      PROCESSING: 0,
      RESOLVED: 0,
      DISMISSED: 0,
    };

    let totalAll = 0;
    for (const group of statsGroup) {
      statsMap[group.status] = group._count._all;
      totalAll += group._count._all;
    }

    const stats: AdminComplaintStatsDto = {
      total: totalAll,
      received: statsMap.RECEIVED,
      processing: statsMap.PROCESSING,
      resolved: statsMap.RESOLVED,
      dismissed: statsMap.DISMISSED,
    };

    return {
      items: items.map(mapComplaintToDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats,
    };
  }

  async getComplaintById(id: string): Promise<AdminComplaintItemDto> {
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: { id: true, code: true, status: true, grandTotal: true },
        },
      },
    });

    if (!complaint) {
      throw new DomainError('COMPLAINT_NOT_FOUND', {
        messageKey: 'Phieu khieu nai khong ton tai hoac da bi xoa',
        status: 404,
      });
    }

    return mapComplaintToDto(complaint);
  }

  async updateComplaintStatus(
    id: string,
    input: UpdateComplaintStatusInput,
    changedBy: string,
  ): Promise<AdminComplaintItemDto> {
    const existing = await prisma.complaint.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new DomainError('COMPLAINT_NOT_FOUND', {
        messageKey: 'Phieu khieu nai khong ton tai hoac da bi xoa',
        status: 404,
      });
    }

    const isFinished = input.status === 'RESOLVED' || input.status === 'DISMISSED';

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: input.status,
        resolutionNote: input.resolutionNote !== undefined ? input.resolutionNote : existing.resolutionNote,
        resolvedBy: changedBy,
        resolvedAt: isFinished ? new Date() : null,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: { id: true, code: true, status: true, grandTotal: true },
        },
      },
    });

    return mapComplaintToDto(updated);
  }

  async deleteComplaint(id: string): Promise<{ success: boolean; id: string }> {
    const existing = await prisma.complaint.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      throw new DomainError('COMPLAINT_NOT_FOUND', {
        messageKey: 'Phieu khieu nai khong ton tai hoac da bi xoa',
        status: 404,
      });
    }

    await prisma.complaint.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, id };
  }

  async createComplaint(input: CreateComplaintInput): Promise<AdminComplaintItemDto> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `KN-${randomSuffix}`;

    let orderId: string | null = null;
    let customerId: string | null = null;

    if (input.orderCode && input.orderCode.trim()) {
      const trimmedCode = input.orderCode.trim();
      const order = await prisma.order.findFirst({
        where: { code: { equals: trimmedCode, mode: 'insensitive' } },
        select: { id: true, code: true, customerId: true, receiverName: true, receiverEmail: true },
      });
      if (!order) {
        throw new DomainError('ORDER_NOT_FOUND', {
          messageKey: `Không tìm thấy đơn hàng có mã "${trimmedCode}". Vui lòng kiểm tra lại mã đơn hàng chính xác trên hóa đơn hoặc trang tra cứu đơn hàng.`,
          status: 404,
        });
      }
      orderId = order.id;
      customerId = order.customerId;
    }

    if (!customerId && input.customerPhone) {
      const customer = await prisma.customer.findFirst({
        where: { phone: input.customerPhone.trim() },
        select: { id: true },
      });
      if (customer) {
        customerId = customer.id;
      }
    }

    const created = await prisma.complaint.create({
      data: {
        code,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        orderId,
        orderCode: input.orderCode ? input.orderCode.trim() : null,
        serialNumber: input.serialNumber ? input.serialNumber.trim() : null,
        category: input.category,
        title: input.title ?? null,
        description: input.description,
        attachments: input.attachments ?? [],
        customerId,
        status: 'RECEIVED',
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: { id: true, code: true, status: true, grandTotal: true },
        },
      },
    });

    return mapComplaintToDto(created);
  }

  async lookupComplaints(query: string): Promise<readonly AdminComplaintItemDto[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const items = await prisma.complaint.findMany({
      where: {
        isActive: true,
        OR: [
          { code: { equals: trimmed, mode: 'insensitive' } },
          { customerPhone: { equals: trimmed } },
          { orderCode: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return items.map(mapComplaintToDto);
  }
}

export const adminComplaintService = new AdminComplaintService();
