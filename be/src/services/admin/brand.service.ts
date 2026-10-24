import { Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateBrandInput,
  QueryBrandInput,
  UpdateBrandInput,
} from '../../validations/admin/brand.schema.js';

export type BrandCategorySummary = {
  id: number;
  name: string;
  slug: string;
};

export type BrandDto = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productTemplateCount: number;
  categories: BrandCategorySummary[];
};

export type BrandListResult = {
  items: BrandDto[];
  total: number;
  page: number;
  limit: number;
};

export class AdminBrandService {
  async getBrands(query: QueryBrandInput): Promise<BrandListResult> {
    const where: Prisma.BrandWhereInput = {};

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.brand.count({ where });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = limit > 0 ? (page - 1) * limit : 0;
    const take = limit > 0 ? limit : undefined;

    const brands = await prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take,
      include: {
        _count: {
          select: {
            productTemplates: true,
          },
        },
        productTemplates: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const items: BrandDto[] = brands.map((brand) => {
      const categoryMap = new Map<number, BrandCategorySummary>();
      for (const pt of brand.productTemplates) {
        if (pt.category && !categoryMap.has(pt.category.id)) {
          categoryMap.set(pt.category.id, {
            id: pt.category.id,
            name: pt.category.name,
            slug: pt.category.slug,
          });
        }
      }

      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
        productTemplateCount: brand._count.productTemplates,
        categories: Array.from(categoryMap.values()),
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getBrandById(id: number): Promise<BrandDto> {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productTemplates: true,
          },
        },
        productTemplates: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!brand) {
      throw new DomainError('BRAND_NOT_FOUND', {
        messageKey: 'Khong tim thay thuong hieu',
        status: 404,
      });
    }

    const categoryMap = new Map<number, BrandCategorySummary>();
    for (const pt of brand.productTemplates) {
      if (pt.category && !categoryMap.has(pt.category.id)) {
        categoryMap.set(pt.category.id, {
          id: pt.category.id,
          name: pt.category.name,
          slug: pt.category.slug,
        });
      }
    }

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      productTemplateCount: brand._count.productTemplates,
      categories: Array.from(categoryMap.values()),
    };
  }

  async createBrand(input: CreateBrandInput): Promise<BrandDto> {
    const existingName = await prisma.brand.findUnique({
      where: { name: input.name },
    });
    if (existingName) {
      throw new DomainError('BRAND_NAME_ALREADY_EXISTS', {
        messageKey: 'Ten thuong hieu da ton tai tren he thong',
        details: { name: input.name },
        status: 400,
      });
    }

    const existingSlug = await prisma.brand.findUnique({
      where: { slug: input.slug },
    });
    if (existingSlug) {
      throw new DomainError('BRAND_SLUG_ALREADY_EXISTS', {
        messageKey: 'Ma duong dan (slug) da duoc su dung boi thuong hieu khac',
        details: { slug: input.slug },
        status: 400,
      });
    }

    const created = await prisma.brand.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            productTemplates: true,
          },
        },
      },
    });

    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      productTemplateCount: created._count.productTemplates,
      categories: [],
    };
  }

  async updateBrand(id: number, input: UpdateBrandInput): Promise<BrandDto> {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new DomainError('BRAND_NOT_FOUND', {
        messageKey: 'Khong tim thay thuong hieu',
        status: 404,
      });
    }

    if (input.name && input.name !== brand.name) {
      const existingName = await prisma.brand.findUnique({
        where: { name: input.name },
      });
      if (existingName) {
        throw new DomainError('BRAND_NAME_ALREADY_EXISTS', {
          messageKey: 'Ten thuong hieu da ton tai tren he thong',
          details: { name: input.name },
          status: 400,
        });
      }
    }

    if (input.slug && input.slug !== brand.slug) {
      const existingSlug = await prisma.brand.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) {
        throw new DomainError('BRAND_SLUG_ALREADY_EXISTS', {
          messageKey: 'Ma duong dan (slug) da duoc su dung boi thuong hieu khac',
          details: { slug: input.slug },
          status: 400,
        });
      }
    }

    const data: Prisma.BrandUpdateInput = {};
    if (input.name !== undefined) {
      data.name = input.name;
    }
    if (input.slug !== undefined) {
      data.slug = input.slug;
    }
    if (input.description !== undefined) {
      data.description = input.description;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    const updated = await prisma.brand.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            productTemplates: true,
          },
        },
        productTemplates: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<number, BrandCategorySummary>();
    for (const pt of updated.productTemplates) {
      if (pt.category && !categoryMap.has(pt.category.id)) {
        categoryMap.set(pt.category.id, {
          id: pt.category.id,
          name: pt.category.name,
          slug: pt.category.slug,
        });
      }
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      productTemplateCount: updated._count.productTemplates,
      categories: Array.from(categoryMap.values()),
    };
  }

  async toggleBrandStatus(id: number): Promise<BrandDto> {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new DomainError('BRAND_NOT_FOUND', {
        messageKey: 'Khong tim thay thuong hieu',
        status: 404,
      });
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        isActive: !brand.isActive,
      },
      include: {
        _count: {
          select: {
            productTemplates: true,
          },
        },
        productTemplates: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<number, BrandCategorySummary>();
    for (const pt of updated.productTemplates) {
      if (pt.category && !categoryMap.has(pt.category.id)) {
        categoryMap.set(pt.category.id, {
          id: pt.category.id,
          name: pt.category.name,
          slug: pt.category.slug,
        });
      }
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      productTemplateCount: updated._count.productTemplates,
      categories: Array.from(categoryMap.values()),
    };
  }

  async deleteBrand(id: number): Promise<{ success: boolean; id: number }> {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productTemplates: true,
          },
        },
      },
    });

    if (!brand) {
      throw new DomainError('BRAND_NOT_FOUND', {
        messageKey: 'Khong tim thay thuong hieu',
        status: 404,
      });
    }

    if (brand._count.productTemplates > 0) {
      throw new DomainError('BRAND_HAS_ASSOCIATED_PRODUCTS', {
        messageKey: 'Khong the xoa thuong hieu dang co san pham lien ket. Vui long chuyen trang thai sang tam dung.',
        details: { productCount: brand._count.productTemplates },
        status: 400,
      });
    }

    await prisma.brand.delete({
      where: { id },
    });

    return {
      success: true,
      id,
    };
  }
}

export const adminBrandService = new AdminBrandService();
