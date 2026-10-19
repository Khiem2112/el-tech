import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function countRecords(): Promise<void> {
  try {
    const [
      users,
      customers,
      pcBundles,
      bundleItems,
      orders,
      orderLines,
      payments,
      reviews,
      ordersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.pcBundle.count(),
      prisma.pcBundleItem.count(),
      prisma.order.count(),
      prisma.orderLine.count(),
      prisma.payment.count(),
      prisma.review.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    console.log('--- THONG KE TONG QUAN DU LIEU HE THONG EL-TECH ---');
    console.log(`Tong so User: ${users}`);
    console.log(`Tong so Customer: ${customers}`);
    console.log(`Tong so PcBundle (bo may dong san): ${pcBundles}`);
    console.log(`Tong so PcBundleItem (linh kien trong bundle): ${bundleItems}`);
    console.log(`Tong so Don hang (Order): ${orders}`);
    console.log(`Tong so OrderLine: ${orderLines}`);
    console.log(`Tong so Payment records: ${payments}`);
    console.log(`Tong so Review da xac thuc: ${reviews}`);
    console.log('Phan bo don hang theo trang thai Kanban:');
    for (const group of ordersByStatus) {
      console.log(`  + ${group.status}: ${group._count.id} don hang`);
    }
  } catch (error) {
    console.error('Loi khi dem ban ghi:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

countRecords();
