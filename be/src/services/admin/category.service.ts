import { Prisma } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  CreateCategoryInput,
  QueryCategoryInput,
  SpecAttribute,
  UpdateCategoryInput,
  UpdateSpecSchemaPayload,
} from '../../validations/admin/category.schema.js';

export type CategoryDto = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  specificationSchema: SpecAttribute[];
  specificationSchemaVersion: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productTemplateCount: number;
  totalInventory: number;
  activeTransfers: number;
};

export type CategoryTreeNode = CategoryDto & {
  children: CategoryTreeNode[];
};

export function normalizeSpecSchema(raw: unknown): SpecAttribute[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    if (!item || typeof item !== 'object') {
      return {
        key: 'unknown',
        label: 'Unknown',
        type: 'text',
        unit: null,
        required: false,
        filterable: false,
        comparable: false,
        options: [],
        isDeprecated: false,
      };
    }
    const record = item as Record<string, unknown>;
    const key = String(record.key || record.stable_key || '').trim().toLowerCase();
    const label = String(record.label || key || '').trim();
    const rawType = String(record.type || record.data_type || 'text').trim().toLowerCase();
    let type: 'text' | 'number' | 'boolean' | 'select' = 'text';
    if (rawType === 'number') {
      type = 'number';
    } else if (rawType === 'boolean') {
      type = 'boolean';
    } else if (rawType === 'select' || rawType === 'enum') {
      type = 'select';
    }
    const unit = record.unit !== undefined && record.unit !== null ? String(record.unit).trim() : null;
    const required = Boolean(record.required ?? record.is_required);
    const filterable = Boolean(record.filterable ?? record.is_filterable);
    const comparable = Boolean(record.comparable ?? record.is_comparable);
    const rawOptions = record.options ?? record.allowed_values;
    const options = Array.isArray(rawOptions) ? rawOptions.map(String) : [];
    const isDeprecated = Boolean(record.isDeprecated ?? record.is_deprecated);

    return {
      key,
      label,
      type,
      unit,
      required,
      filterable,
      comparable,
      options,
      isDeprecated,
    };
  });
}

export class AdminCategoryService {
  async getCategories(query: QueryCategoryInput): Promise<CategoryDto[] | CategoryTreeNode[]> {
    const where: Prisma.CategoryWhereInput = {};

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.parentId !== undefined) {
      where.parentId = query.parentId;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });

    const [templateCounts, stockQuantSums, activeTransfers] = await Promise.all([
      prisma.productTemplate.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
      prisma.stockQuant.findMany({
        where: { isActive: true },
        select: {
          onHand: true,
          sku: {
            select: {
              productTemplate: {
                select: { categoryId: true },
              },
            },
          },
        },
      }),
      prisma.stockMoveLine.findMany({
        where: {
          stockMove: {
            moveType: 'INTERNAL_TRANSFER',
            status: { in: ['DRAFT', 'RESERVED', 'IN_TRANSIT'] },
          },
        },
        select: {
          sku: {
            select: {
              productTemplate: {
                select: { categoryId: true },
              },
            },
          },
        },
      }),
    ]);

    const templateCountMap = new Map<number, number>();
    for (const item of templateCounts) {
      templateCountMap.set(item.categoryId, item._count.id);
    }

    const inventoryMap = new Map<number, number>();
    for (const quant of stockQuantSums) {
      const catId = quant.sku.productTemplate.categoryId;
      inventoryMap.set(catId, (inventoryMap.get(catId) || 0) + quant.onHand);
    }

    const transferMap = new Map<number, number>();
    for (const line of activeTransfers) {
      const catId = line.sku.productTemplate.categoryId;
      transferMap.set(catId, (transferMap.get(catId) || 0) + 1);
    }

    const dtoList: CategoryDto[] = categories.map((cat) => ({
      id: cat.id,
      parentId: cat.parentId,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      specificationSchema: normalizeSpecSchema(cat.specificationSchema),
      specificationSchemaVersion: cat.specificationSchemaVersion,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      productTemplateCount: templateCountMap.get(cat.id) || 0,
      totalInventory: inventoryMap.get(cat.id) || 0,
      activeTransfers: transferMap.get(cat.id) || 0,
    }));

    if (query.tree) {
      return this.buildTree(dtoList);
    }

    return dtoList;
  }

  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const list = (await this.getCategories({ tree: false })) as CategoryDto[];
    return this.buildTree(list);
  }

  async getCategoryById(id: number): Promise<CategoryDto> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new DomainError('CATEGORY_NOT_FOUND', {
        messageKey: 'Khong tim thay danh muc nganh hang',
        status: 404,
      });
    }

    return this.enrichCategoryMetrics(category);
  }

  async createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
    const existingSlug = await prisma.category.findUnique({
      where: { slug: input.slug },
    });

    if (existingSlug) {
      throw new DomainError('CATEGORY_SLUG_ALREADY_EXISTS', {
        messageKey: 'Ma duong dan (slug) da duoc su dung boi danh muc khac',
        details: { slug: input.slug },
        status: 400,
      });
    }

    if (input.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new DomainError('PARENT_CATEGORY_NOT_FOUND', {
          messageKey: 'Danh muc cha duoc chon khong ton tai',
          status: 400,
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        parentId: input.parentId ?? null,
        description: input.description ?? null,
        specificationSchema: (input.specificationSchema || []) as unknown as Prisma.InputJsonValue,
        specificationSchemaVersion: 1,
        isActive: input.isActive ?? true,
      },
    });

    return this.enrichCategoryMetrics(category);
  }

  async updateCategory(id: number, input: UpdateCategoryInput): Promise<CategoryDto> {
    const current = await prisma.category.findUnique({
      where: { id },
    });

    if (!current) {
      throw new DomainError('CATEGORY_NOT_FOUND', {
        messageKey: 'Khong tim thay danh muc nganh hang',
        status: 404,
      });
    }

    if (input.slug && input.slug !== current.slug) {
      const conflict = await prisma.category.findUnique({
        where: { slug: input.slug },
      });
      if (conflict && conflict.id !== id) {
        throw new DomainError('CATEGORY_SLUG_ALREADY_EXISTS', {
          messageKey: 'Ma duong dan (slug) da duoc su dung boi danh muc khac',
          details: { slug: input.slug },
          status: 400,
        });
      }
    }

    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === id) {
        throw new DomainError('CATEGORY_SELF_PARENT_FORBIDDEN', {
          ruleId: 'CAT-001',
          messageKey: 'Khong the chon chinh danh muc do lam danh muc cha',
          status: 400,
        });
      }

      await this.assertNoCircularHierarchy(id, input.parentId);
    }

    const data: Prisma.CategoryUpdateInput = {};

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
    if (input.parentId !== undefined) {
      data.parent = input.parentId ? { connect: { id: input.parentId } } : { disconnect: true };
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return this.enrichCategoryMetrics(updated);
  }

  async updateSpecificationSchema(
    id: number,
    payload: UpdateSpecSchemaPayload,
  ): Promise<CategoryDto> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productTemplates: true },
        },
      },
    });

    if (!category) {
      throw new DomainError('CATEGORY_NOT_FOUND', {
        messageKey: 'Khong tim thay danh muc nganh hang',
        status: 404,
      });
    }

    const existingSchema = normalizeSpecSchema(category.specificationSchema);
    const newSchema = payload.specificationSchema;
    const productCount = category._count.productTemplates;

    if (productCount > 0 && existingSchema.length > 0) {
      const newFieldMap = new Map(newSchema.map((field) => [field.key, field]));

      for (const oldField of existingSchema) {
        const matchingNewField = newFieldMap.get(oldField.key);

        if (!matchingNewField) {
          throw new DomainError('CAT_009_CANNOT_DELETE_FIELD', {
            ruleId: 'CAT-009',
            messageKey: `Khong the xoa thuoc tinh "${oldField.label || oldField.key}" vi danh muc da co ${productCount} mau san pham dang su dung. Quy tac CAT-009 yeu cau giu nguyen va danh dau ngung kich hoat.`,
            details: { fieldKey: oldField.key, productCount },
            status: 400,
          });
        }

        if (matchingNewField.type !== oldField.type) {
          throw new DomainError('CAT_009_CANNOT_CHANGE_DATA_TYPE', {
            ruleId: 'CAT-009',
            messageKey: `Khong the thay doi kieu du lieu cua thuoc tinh "${oldField.label || oldField.key}" tu "${oldField.type}" sang "${matchingNewField.type}" vi da co san pham su dung theo quy tac CAT-009.`,
            details: {
              fieldKey: oldField.key,
              oldType: oldField.type,
              newType: matchingNewField.type,
              productCount,
            },
            status: 400,
          });
        }
      }
    }

    const nextVersion = category.specificationSchemaVersion + 1;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        specificationSchema: newSchema as unknown as Prisma.InputJsonValue,
        specificationSchemaVersion: nextVersion,
      },
    });

    return this.enrichCategoryMetrics(updated);
  }

  async toggleCategoryStatus(id: number): Promise<CategoryDto> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new DomainError('CATEGORY_NOT_FOUND', {
        messageKey: 'Khong tim thay danh muc nganh hang',
        status: 404,
      });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive,
      },
    });

    return this.enrichCategoryMetrics(updated);
  }

  private async assertNoCircularHierarchy(categoryId: number, targetParentId: number): Promise<void> {
    let currentId: number | null = targetParentId;
    const visitedIds = new Set<number>();

    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new DomainError('CATEGORY_CIRCULAR_HIERARCHY_FORBIDDEN', {
          ruleId: 'CAT-001',
          messageKey: 'Danh muc cha khong the la mot trong cac danh muc con cua danh muc hien tai',
          status: 400,
        });
      }

      if (visitedIds.has(currentId)) {
        break;
      }
      visitedIds.add(currentId);

      const parentCategory: { parentId: number | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = parentCategory?.parentId ?? null;
    }
  }

  private async enrichCategoryMetrics(category: {
    id: number;
    parentId: number | null;
    name: string;
    slug: string;
    description: string | null;
    specificationSchema: Prisma.JsonValue;
    specificationSchemaVersion: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<CategoryDto> {
    const [templateCount, stockSum, transferCount] = await Promise.all([
      prisma.productTemplate.count({
        where: { categoryId: category.id },
      }),
      prisma.stockQuant.aggregate({
        where: {
          isActive: true,
          sku: {
            productTemplate: { categoryId: category.id },
          },
        },
        _sum: { onHand: true },
      }),
      prisma.stockMoveLine.count({
        where: {
          stockMove: {
            moveType: 'INTERNAL_TRANSFER',
            status: { in: ['DRAFT', 'RESERVED', 'IN_TRANSIT'] },
          },
          sku: {
            productTemplate: { categoryId: category.id },
          },
        },
      }),
    ]);

    return {
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      specificationSchema: normalizeSpecSchema(category.specificationSchema),
      specificationSchemaVersion: category.specificationSchemaVersion,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productTemplateCount: templateCount,
      totalInventory: stockSum._sum.onHand || 0,
      activeTransfers: transferCount,
    };
  }

  private buildTree(items: CategoryDto[]): CategoryTreeNode[] {
    const nodeMap = new Map<number, CategoryTreeNode>();

    for (const item of items) {
      nodeMap.set(item.id, {
        ...item,
        children: [],
      });
    }

    const roots: CategoryTreeNode[] = [];

    for (const item of items) {
      const node = nodeMap.get(item.id);
      if (!node) {
        continue;
      }

      if (item.parentId && nodeMap.has(item.parentId)) {
        const parentNode = nodeMap.get(item.parentId);
        parentNode?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}

export const adminCategoryService = new AdminCategoryService();
