const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function countProductRecords() {
  try {
    // Lay so luong ban ghi mau san pham va bien the san pham
    const [
      totalTemplates,
      activeTemplates,
      totalVariants,
      activeVariants,
      totalBundles,
      templatesByLifecycle,
      totalStockQuant,
    ] = await Promise.all([
      prisma.productTemplate.count(),
      prisma.productTemplate.count({
        where: { lifecycleState: 'ACTIVE', isActive: true },
      }),
      prisma.productVariant.count(),
      prisma.productVariant.count({
        where: { lifecycleState: 'ACTIVE', isActive: true },
      }),
      prisma.pcBundle.count(),
      prisma.productTemplate.groupBy({
        by: ['lifecycleState'],
        _count: { id: true },
      }),
      prisma.stockQuant.aggregate({
        _sum: { onHand: true, reserved: true },
        _count: { id: true },
      }),
    ]);

    // Thong ke theo danh muc san pham
    const categoriesWithCount = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: { productTemplates: true },
        },
      },
      orderBy: {
        productTemplates: {
          _count: 'desc',
        },
      },
    });

    console.log('--- THONG KE RECORD SAN PHAM TRONG HE THONG ---');
    console.log(`Tong so ProductTemplate (mau san pham): ${totalTemplates}`);
    console.log(`- Dang hoat dong (ACTIVE): ${activeTemplates}`);
    console.log('Chi tiet trang thai vong doi (ProductTemplate):');
    templatesByLifecycle.forEach((group) => {
      console.log(`  + ${group.lifecycleState}: ${group._count.id}`);
    });

    console.log(`\nTong so ProductVariant (SKU ban le): ${totalVariants}`);
    console.log(`- Dang hoat dong (ACTIVE): ${activeVariants}`);

    console.log(`\nTong so PcBundle (bo PC dong san): ${totalBundles}`);

    console.log('\nThong ke ton kho (StockQuant):');
    console.log(`- So ban ghi ton kho theo chi nhanh: ${totalStockQuant._count.id || 0}`);
    console.log(`- Tong so luong ton kho kha dung (on_hand): ${totalStockQuant._sum.onHand || 0}`);
    console.log(`- Tong so luong dang giu cho don hang (reserved): ${totalStockQuant._sum.reserved || 0}`);

    console.log('\nPhan bo theo danh muc:');
    categoriesWithCount.forEach((cat) => {
      console.log(`- ${cat.name} (${cat.slug}): ${cat._count.productTemplates} mau san pham`);
    });
  } catch (error) {
    console.error('Loi khi truy van co so du lieu:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

countProductRecords();
