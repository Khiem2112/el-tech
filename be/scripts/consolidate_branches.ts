import { prisma } from '../src/lib/prisma.js';

async function consolidateBranches(): Promise<void> {
  console.log('Bat dau tien trinh hop nhat chi nhanh ve 1 showroom duy nhat...');

  const allBranches = await prisma.branch.findMany({
    orderBy: { id: 'asc' },
  });

  if (allBranches.length === 0) {
    console.log('Khong tim thay chi nhanh nao trong he thong. Tao moi Showroom EL-TECH...');
    const newMain = await prisma.branch.create({
      data: {
        code: 'STORE-MAIN',
        name: 'Showroom EL-TECH',
        address: '280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh',
        deliveryPriority: 1,
        isActive: true,
      },
    });
    console.log(`Da tao chi nhanh chinh duy nhat: ID ${newMain.id}, Code ${newMain.code}`);
    return;
  }

  // Chon chi nhanh chinh: uu tien code STORE-MAIN hoac lay chi nhanh dau tien
  let mainBranch = allBranches.find((b) => b.code === 'STORE-MAIN') || allBranches[0];

  // Chuan hoa thong tin chi nhanh chinh
  mainBranch = await prisma.branch.update({
    where: { id: mainBranch.id },
    data: {
      code: 'STORE-MAIN',
      name: 'Showroom EL-TECH',
      address: '280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh',
      deliveryPriority: 1,
      isActive: true,
    },
  });

  console.log(`Chi nhanh chinh duoc xac lap: ID ${mainBranch.id}, Code: ${mainBranch.code}, Name: ${mainBranch.name}`);

  const extraBranches = allBranches.filter((b) => b.id !== mainBranch.id);
  console.log(`So luong chi nhanh thua can don ve chi nhanh chinh: ${extraBranches.length}`);

  for (const extra of extraBranches) {
    console.log(`Dang xu ly don du lieu tu chi nhanh thua: ID ${extra.id}, Code: ${extra.code}, Name: ${extra.name}`);

    // 1. Chuyen Orders
    const updatedOrders = await prisma.order.updateMany({
      where: { fulfillmentBranchId: extra.id },
      data: {
        fulfillmentBranchId: mainBranch.id,
      },
    });
    console.log(`  Da chuyen ${updatedOrders.count} don hang sang chi nhanh chinh.`);

    // Cap nhat branchSnapshot cho cac don hang lien quan
    const ordersToUpdateSnapshot = await prisma.order.findMany({
      where: { fulfillmentBranchId: mainBranch.id },
      select: { id: true },
    });
    for (const ord of ordersToUpdateSnapshot) {
      await prisma.order.update({
        where: { id: ord.id },
        data: {
          branchSnapshot: {
            id: mainBranch.id,
            name: mainBranch.name,
            address: mainBranch.address,
          },
        },
      });
    }

    // 2. Chuyen StockMoves
    const updatedSourceMoves = await prisma.stockMove.updateMany({
      where: { sourceBranchId: extra.id },
      data: { sourceBranchId: mainBranch.id },
    });
    const updatedDestMoves = await prisma.stockMove.updateMany({
      where: { destinationBranchId: extra.id },
      data: { destinationBranchId: mainBranch.id },
    });
    console.log(`  Da chuyen ${updatedSourceMoves.count} stock move nguon va ${updatedDestMoves.count} stock move dich.`);

    // 3. Chuyen SerialUnits
    const updatedSerials = await prisma.serialUnit.updateMany({
      where: { currentBranchId: extra.id },
      data: { currentBranchId: mainBranch.id },
    });
    console.log(`  Da chuyen ${updatedSerials.count} so se-ri sang chi nhanh chinh.`);

    // 4. Chuyen SerialMovements
    const updatedFromSerialMoves = await prisma.serialMovement.updateMany({
      where: { fromBranchId: extra.id },
      data: { fromBranchId: mainBranch.id },
    });
    const updatedToSerialMoves = await prisma.serialMovement.updateMany({
      where: { toBranchId: extra.id },
      data: { toBranchId: mainBranch.id },
    });
    console.log(`  Da cap nhat ${updatedFromSerialMoves.count} from-moves va ${updatedToSerialMoves.count} to-moves cua serial.`);

    // 5. Chuyen PurchaseOrders
    const updatedPOs = await prisma.purchaseOrder.updateMany({
      where: { receivingBranchId: extra.id },
      data: { receivingBranchId: mainBranch.id },
    });
    console.log(`  Da chuyen ${updatedPOs.count} don mua hang PO sang chi nhanh chinh.`);

    // 6. Chuyen Coupons
    const updatedCoupons = await prisma.coupon.updateMany({
      where: { branchId: extra.id },
      data: { branchId: mainBranch.id },
    });
    console.log(`  Da chuyen ${updatedCoupons.count} coupon sang chi nhanh chinh.`);

    // 7. Xu ly StockQuants (Cong don so luong ton kho vao chi nhanh chinh)
    const extraQuants = await prisma.stockQuant.findMany({
      where: { branchId: extra.id },
    });
    console.log(`  Dang xu ly cong don ${extraQuants.length} ban ghi ton kho...`);

    let mergedCount = 0;
    let reassignedCount = 0;

    for (const eq of extraQuants) {
      const mainQuant = await prisma.stockQuant.findUnique({
        where: {
          branchId_skuId: {
            branchId: mainBranch.id,
            skuId: eq.skuId,
          },
        },
      });

      if (mainQuant) {
        // Chi nhanh chinh da co SKU nay: cong don ton kho
        await prisma.stockQuant.update({
          where: { id: mainQuant.id },
          data: {
            onHand: { increment: eq.onHand },
            reserved: { increment: eq.reserved },
            quarantineDamaged: { increment: eq.quarantineDamaged },
          },
        });

        // Chuyen tat ca cac ban ghi so cai StockLedgerEntry sang quant cua chi nhanh chinh
        await prisma.stockLedgerEntry.updateMany({
          where: { stockQuantId: eq.id },
          data: { stockQuantId: mainQuant.id },
        });

        // Xoa quant cua chi nhanh thua
        await prisma.stockQuant.delete({
          where: { id: eq.id },
        });
        mergedCount++;
      } else {
        // Chi nhanh chinh chua co SKU nay: chuyen truc tiep branchId sang mainBranch
        await prisma.stockQuant.update({
          where: { id: eq.id },
          data: { branchId: mainBranch.id },
        });
        reassignedCount++;
      }
    }
    console.log(`  Da cong don ${mergedCount} quant trung lap va chuyen quyen ${reassignedCount} quant moi.`);

    // 8. Xoa ban ghi chi nhanh thua khoi bang Branch
    await prisma.branch.delete({
      where: { id: extra.id },
    });
    console.log(`  Da xoa thanh cong chi nhanh thua ID ${extra.id} (${extra.name}).`);
  }

  // Kiem tra lai ket qua cuoi cung
  const remainingBranches = await prisma.branch.findMany();
  console.log('Ket qua sau hop nhat:');
  console.log(`So luong chi nhanh hien tai trong he thong: ${remainingBranches.length}`);
  for (const b of remainingBranches) {
    console.log(`Chi nhanh duy nhat: ID ${b.id}, Code: ${b.code}, Name: ${b.name}, Address: ${b.address}`);
  }
}

consolidateBranches()
  .then(() => {
    console.log('Hoan tat hop nhat va don dep du lieu chi nhanh thanh cong.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Loi khi hop nhat chi nhanh:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
