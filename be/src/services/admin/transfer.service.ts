import { StockMoveStatus } from '@prisma/client';
import { DomainError } from '../../contracts/domain-error.js';
import {
  CancelTransferInput,
  CreateTransferInput,
  DispatchTransferInput,
  QueryTransferInput,
  ReceiveTransferInput,
} from '../../validations/admin/transfer.schema.js';

export type TransferStatusDisplay = 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export type TransferLineItemDto = {
  id: string;
  skuId: number;
  skuCode: string;
  productName: string;
  productImage: string | null;
  variationLabel: string | null;
  quantity: number;
  unitCost: string;
  serialRequired: boolean;
  serialNumbers: string[];
};

export type TransferListItemDto = {
  id: string;
  code: string;
  status: StockMoveStatus;
  displayStatus: TransferStatusDisplay;
  sourceBranchId: number;
  sourceBranchCode: string;
  sourceBranchName: string;
  destinationBranchId: number;
  destinationBranchCode: string;
  destinationBranchName: string;
  totalQuantity: number;
  lineCount: number;
  primaryProductName: string;
  primaryProductImage: string | null;
  reason: string | null;
  createdAt: Date;
  dispatchedAt: Date | null;
  validatedAt: Date | null;
  cancelledAt: Date | null;
  dispatchedByName: string | null;
  validatedByName: string | null;
  lines: TransferLineItemDto[];
};

export type TransferSummaryDto = {
  totalTransfers: number;
  inTransitUnits: number;
  connectedBranchesCount: number;
  fullReceiptRate: string;
};

export type TransferListResult = {
  items: TransferListItemDto[];
  total: number;
  page: number;
  limit: number;
  summary: TransferSummaryDto;
};

export type TransferDetailDto = TransferListItemDto & {
  sourceBranchAddress: string;
  destinationBranchAddress: string;
};

export type TransferEligibleSkuDto = {
  skuId: number;
  skuCode: string;
  productName: string;
  productImage: string | null;
  variationLabel: string | null;
  availableQuantity: number;
  onHand: number;
  reserved: number;
  serialRequired: boolean;
  currentCost: string;
};

class AdminTransferService {
  async listTransfers(query: QueryTransferInput): Promise<TransferListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      items: [],
      total: 0,
      page,
      limit,
      summary: {
        totalTransfers: 0,
        inTransitUnits: 0,
        connectedBranchesCount: 1,
        fullReceiptRate: '100%',
      },
    };
  }

  async getEligibleSourceSkus(_branchId: number): Promise<TransferEligibleSkuDto[]> {
    return [];
  }

  async getTransferAvailableSerials(_transferId: string, _skuId: number): Promise<string[]> {
    return [];
  }

  async getTransferById(id: string): Promise<TransferDetailDto> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 404,
      messageKey: 'Quy trinh dieu chuyen kho da chi nhanh da duoc loai bo khoi he thong',
      details: { id },
    });
  }

  async createTransfer(_input: CreateTransferInput, _adminUserId?: string): Promise<TransferDetailDto> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 400,
      messageKey: 'Quy trinh dieu chuyen kho da chi nhanh da duoc loai bo khoi he thong',
    });
  }

  async dispatchTransfer(
    _id: string,
    _input?: DispatchTransferInput,
    _adminUserId?: string,
  ): Promise<TransferDetailDto> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 400,
      messageKey: 'Quy trinh dieu chuyen kho da chi nhanh da duoc loai bo khoi he thong',
    });
  }

  async receiveTransfer(
    _id: string,
    _input?: ReceiveTransferInput,
    _adminUserId?: string,
  ): Promise<TransferDetailDto> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 400,
      messageKey: 'Quy trinh dieu chuyen kho da chi nhanh da duoc loai bo khoi he thong',
    });
  }

  async cancelTransfer(
    _id: string,
    _input: CancelTransferInput,
    _adminUserId?: string,
  ): Promise<TransferDetailDto> {
    throw new DomainError('FEATURE_DISABLED', {
      status: 400,
      messageKey: 'Quy trinh dieu chuyen kho da chi nhanh da duoc loai bo khoi he thong',
    });
  }
}

export const adminTransferService = new AdminTransferService();
