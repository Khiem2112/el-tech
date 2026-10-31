import { StockMoveStatus } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import {
  CreateSupplierReturnInput,
  QuerySupplierReturnInput,
} from '../../validations/admin/supplier-return.schema.js';

export type SupplierReturnListItemDto = {
  id: string;
  code: string;
  status: StockMoveStatus;
  reason: string | null;
  sourceBranchId: number | null;
  sourceBranchName: string | null;
  sourceBranchCode: string | null;
  inboundMoveId: string | null;
  inboundMoveCode: string | null;
  purchaseOrderId: string | null;
  purchaseOrderCode: string | null;
  supplierId: number | null;
  supplierName: string | null;
  supplierCode: string | null;
  totalQuantity: number;
  lineCount: number;
  returnSources: string[];
  validatedAt: Date | null;
  createdAt: Date;
};

export type SupplierReturnListResult = {
  items: SupplierReturnListItemDto[];
  total: number;
  page: number;
  limit: number;
};

export type EligibleReceiptSkuInfo = {
  skuId: number;
  skuCode: string;
  skuName: string;
  serialRequired: boolean;
  unitCost: string;
  receivedQuantity: number;
  alreadyReturnedQuantity: number;
  maxReturnableQuantity: number;
  currentOnHand: number;
  currentQuarantineDamaged: number;
  availableSerials: string[];
  quarantinedSerials: string[];
};

export type EligibleReceiptMoveDto = {
  inboundMoveId: string;
  inboundMoveCode: string;
  validatedAt: Date | null;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  receivingBranchId: number;
  receivingBranchName: string;
  receivingBranchCode: string;
  skus: EligibleReceiptSkuInfo[];
};

class AdminSupplierReturnService {
  async getSupplierReturns(query: QuerySupplierReturnInput): Promise<SupplierReturnListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      items: [],
      total: 0,
      page,
      limit,
    };
  }

  async getEligibleReceiptMoves(
    _search?: string,
    _supplierId?: number,
    _branchId?: number,
  ): Promise<EligibleReceiptMoveDto[]> {
    return [];
  }

  async getReceiptMoveReturnInfo(receiptMoveId: string): Promise<EligibleReceiptMoveDto> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 404,
      messageKey: 'Quy trinh tra hang nha cung cap da duoc loai bo khoi he thong',
      details: { receiptMoveId },
    });
  }

  async getSupplierReturnById(id: string): Promise<unknown> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 404,
      messageKey: 'Quy trinh tra hang nha cung cap da duoc loai bo khoi he thong',
      details: { id },
    });
  }

  async createSupplierReturn(
    _input: CreateSupplierReturnInput,
    _adminUserId?: string,
  ): Promise<unknown> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 400,
      messageKey: 'Quy trinh tra hang nha cung cap da duoc loai bo khoi he thong',
    });
  }
}

export const adminSupplierReturnService = new AdminSupplierReturnService();
