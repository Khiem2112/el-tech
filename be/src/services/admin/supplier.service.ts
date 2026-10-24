import { Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateSupplierInput,
  QuerySupplierInput,
  UpdateSupplierInput,
} from '../../validations/admin/supplier.schema.js';

export type SupplierDto = {
  id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  purchaseOrderCount: number;
};

export type SupplierListResult = {
  items: SupplierDto[];
  total: number;
  page: number;
  limit: number;
};

export class AdminSupplierService {
  async getSuppliers(query: QuerySupplierInput): Promise<SupplierListResult> {
    const where: Prisma.SupplierWhereInput = {};

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { code: { contains: term, mode: 'insensitive' } },
        { contactName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.supplier.count({ where });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take,
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    const items: SupplierDto[] = suppliers.map((supplier) => ({
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactName: supplier.contactName,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      purchaseOrderCount: supplier._count.purchaseOrders,
    }));

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getSupplierById(id: number): Promise<SupplierDto> {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new DomainError('SUPPLIER_NOT_FOUND', {
        messageKey: 'Khong tim thay nha cung cap',
        status: 404,
      });
    }

    return {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactName: supplier.contactName,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      purchaseOrderCount: supplier._count.purchaseOrders,
    };
  }

  async createSupplier(input: CreateSupplierInput): Promise<SupplierDto> {
    const existingCode = await prisma.supplier.findUnique({
      where: { code: input.code },
    });

    if (existingCode) {
      throw new DomainError('SUPPLIER_CODE_ALREADY_EXISTS', {
        messageKey: 'Ma nha cung cap da ton tai tren he thong',
        details: { code: input.code },
        status: 400,
      });
    }

    const supplier = await prisma.supplier.create({
      data: {
        code: input.code,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
        contactName: input.contactName || null,
        isActive: input.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    return {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactName: supplier.contactName,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
      purchaseOrderCount: supplier._count.purchaseOrders,
    };
  }

  async updateSupplier(id: number, input: UpdateSupplierInput): Promise<SupplierDto> {
    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('SUPPLIER_NOT_FOUND', {
        messageKey: 'Khong tim thay nha cung cap',
        status: 404,
      });
    }

    if (input.code && input.code !== existing.code) {
      const duplicateCode = await prisma.supplier.findUnique({
        where: { code: input.code },
      });

      if (duplicateCode) {
        throw new DomainError('SUPPLIER_CODE_ALREADY_EXISTS', {
          messageKey: 'Ma nha cung cap da ton tai tren he thong',
          details: { code: input.code },
          status: 400,
        });
      }
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(input.code !== undefined && { code: input.code }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.phone !== undefined && { phone: input.phone || null }),
        ...(input.address !== undefined && { address: input.address || null }),
        ...(input.contactName !== undefined && { contactName: input.contactName || null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      contactName: updated.contactName,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      purchaseOrderCount: updated._count.purchaseOrders,
    };
  }

  async toggleSupplierStatus(id: number): Promise<SupplierDto> {
    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new DomainError('SUPPLIER_NOT_FOUND', {
        messageKey: 'Khong tim thay nha cung cap',
        status: 404,
      });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      contactName: updated.contactName,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      purchaseOrderCount: updated._count.purchaseOrders,
    };
  }

  async deleteSupplier(id: number): Promise<{ success: boolean; id: number }> {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new DomainError('SUPPLIER_NOT_FOUND', {
        messageKey: 'Khong tim thay nha cung cap',
        status: 404,
      });
    }

    if (supplier._count.purchaseOrders > 0) {
      throw new DomainError('SUPPLIER_HAS_PURCHASE_ORDERS', {
        messageKey: 'Khong the xoa nha cung cap dang co don mua hang lien ket. Vui long chuyen trang thai sang tam dung.',
        details: { purchaseOrderCount: supplier._count.purchaseOrders },
        status: 400,
      });
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return {
      success: true,
      id,
    };
  }
}

export const adminSupplierService = new AdminSupplierService();
