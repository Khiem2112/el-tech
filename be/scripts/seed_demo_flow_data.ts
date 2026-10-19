import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient, Prisma, ProductLifecycle, OrderStatus, FulfillmentMethod, PaymentMethod, PaymentState, ActorType, SalesLineType } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const DETERMINISTIC_IDS = {
  USER_1: '00000000-0000-4000-a000-000000089241',
  USER_2: '00000000-0000-4000-a000-000000089242',
  CUSTOMER_1: '00000000-0000-4000-b000-000000089241',
  CUSTOMER_2: '00000000-0000-4000-b000-000000089242',
  ORDER_1: '00000000-0000-4000-c000-000000091024',
  ORDER_2: '00000000-0000-4000-c000-000000089820',
  ORDER_3: '00000000-0000-4000-c000-000000089552',
  ORDER_4: '00000000-0000-4000-c000-000000088910',
  ORDER_5: '00000000-0000-4000-c000-000000087621',
  ORDER_6: '00000000-0000-4000-c000-000000086510',
};

async function seedDemoData(): Promise<void> {
  console.log('--- BAT DAU SEED DU LIEU MAU HE THONG EL-TECH ---');

  // Seed Users and Customers
  console.log('Seed thong tin nguoi dung va khach hang...');
  const user1 = await prisma.user.upsert({
    where: { email: 'hoangnam.tech@gmail.com' },
    update: {
      name: 'Nguyen Hoang Nam',
      emailVerified: true,
      role: 'CUSTOMER',
    },
    create: {
      id: DETERMINISTIC_IDS.USER_1,
      name: 'Nguyen Hoang Nam',
      email: 'hoangnam.tech@gmail.com',
      emailVerified: true,
      role: 'CUSTOMER',
    },
  });

  const customer1 = await prisma.customer.upsert({
    where: { userId: user1.id },
    update: {
      name: 'Nguyen Hoang Nam',
      email: 'hoangnam.tech@gmail.com',
      phone: '0988234567',
      emailVerifiedAt: new Date('2025-01-01T00:00:00Z'),
      phoneVerifiedAt: new Date('2025-01-01T00:00:00Z'),
    },
    create: {
      id: DETERMINISTIC_IDS.CUSTOMER_1,
      userId: user1.id,
      name: 'Nguyen Hoang Nam',
      email: 'hoangnam.tech@gmail.com',
      phone: '0988234567',
      emailVerifiedAt: new Date('2025-01-01T00:00:00Z'),
      phoneVerifiedAt: new Date('2025-01-01T00:00:00Z'),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'vuhoangnam.dev@gmail.com' },
    update: {
      name: 'Vu Hoang Nam',
      emailVerified: true,
      role: 'CUSTOMER',
    },
    create: {
      id: DETERMINISTIC_IDS.USER_2,
      name: 'Vu Hoang Nam',
      email: 'vuhoangnam.dev@gmail.com',
      emailVerified: true,
      role: 'CUSTOMER',
    },
  });

  await prisma.customer.upsert({
    where: { userId: user2.id },
    update: {
      name: 'Vu Hoang Nam',
      email: 'vuhoangnam.dev@gmail.com',
      phone: '0912345678',
      emailVerifiedAt: new Date('2025-01-01T00:00:00Z'),
      phoneVerifiedAt: new Date('2025-01-01T00:00:00Z'),
    },
    create: {
      id: DETERMINISTIC_IDS.CUSTOMER_2,
      userId: user2.id,
      name: 'Vu Hoang Nam',
      email: 'vuhoangnam.dev@gmail.com',
      phone: '0912345678',
      emailVerifiedAt: new Date('2025-01-01T00:00:00Z'),
      phoneVerifiedAt: new Date('2025-01-01T00:00:00Z'),
    },
  });

  // Query hardware components for PC bundles
  console.log('Truy van linh kien phan cung cho PC bundles...');
  const getVariantsByCategory = async (categorySlug: string) => {
    return prisma.productVariant.findMany({
      where: {
        productTemplate: { category: { slug: categorySlug }, isActive: true, lifecycleState: 'ACTIVE' },
        isActive: true,
        lifecycleState: 'ACTIVE',
      },
      include: { productTemplate: true },
      take: 5,
    });
  };

  const [cpus, mainboards, rams, vgas, ssds, psus, cases, coolings] = await Promise.all([
    getVariantsByCategory('cpu'),
    getVariantsByCategory('mainboard'),
    getVariantsByCategory('ram'),
    getVariantsByCategory('vga'),
    getVariantsByCategory('ssd'),
    getVariantsByCategory('psu'),
    getVariantsByCategory('case'),
    getVariantsByCategory('tan-nhiet'),
  ]);

  if (!cpus[0] || !mainboards[0] || !rams[0] || !vgas[0] || !ssds[0] || !psus[0] || !cases[0] || !coolings[0]) {
    throw new Error('Khong tim thay du linh kien trong co so du lieu de tao PcBundle');
  }

  // Seed 3 PcBundles
  console.log('Seed 3 bo PC dong san tieu bieu (PcBundle)...');
  const bundleConfigs = [
    {
      name: 'EL APEX · Ryzen 7 9800X3D / RTX 5070 Ti',
      slug: 'el-apex-ryzen-7-9800x3d-rtx-5070-ti',
      description: 'Cau hinh Flagship Gaming toi thuong voi AMD Ryzen 7 9800X3D va do hoa NVIDIA RTX the he moi, san sang cho trai nghiem 4K Ray Tracing.',
      components: [cpus[0], mainboards[0], rams[0], vgas[0], ssds[0], psus[0], cases[0], coolings[0]],
    },
    {
      name: 'EL TITAN · Core i7-14700K / RTX 5080 OC',
      slug: 'el-titan-core-i7-14700k-rtx-5080-oc',
      description: 'Cau hinh Workstation & Do hoa chuyen nghiep voi Intel Core i7-14700K 20 nhan 28 luong va GPU RTX 5080 hieu nang cao.',
      components: [
        cpus[1] || cpus[0],
        mainboards[1] || mainboards[0],
        rams[1] || rams[0],
        vgas[1] || vgas[0],
        ssds[1] || ssds[0],
        psus[1] || psus[0],
        cases[1] || cases[0],
        coolings[1] || coolings[0],
      ],
    },
    {
      name: 'EL NOVA · Core i5-14600K / RTX 4070 SUPER',
      slug: 'el-nova-core-i5-14600k-rtx-4070-super',
      description: 'Cau hinh can bang hoan hao danh cho eSports va sang tao noi dung 2K voi hieu nang tren gia thanh toi uu nhat.',
      components: [
        cpus[2] || cpus[0],
        mainboards[2] || mainboards[0],
        rams[2] || rams[0],
        vgas[2] || vgas[0],
        ssds[2] || ssds[0],
        psus[2] || psus[0],
        cases[2] || cases[0],
        coolings[2] || coolings[0],
      ],
    },
  ];

  const seededBundles = [];
  for (const config of bundleConfigs) {
    const bundle = await prisma.pcBundle.upsert({
      where: { slug: config.slug },
      update: {
        name: config.name,
        description: config.description,
        lifecycleState: ProductLifecycle.ACTIVE,
        isActive: true,
      },
      create: {
        name: config.name,
        slug: config.slug,
        description: config.description,
        lifecycleState: ProductLifecycle.ACTIVE,
        isActive: true,
      },
    });

    // Seed 8 PcBundleItem components
    for (let i = 0; i < config.components.length; i++) {
      const component = config.components[i];
      await prisma.pcBundleItem.upsert({
        where: {
          pcBundleId_skuId: {
            pcBundleId: bundle.id,
            skuId: component.id,
          },
        },
        update: {
          quantity: 1,
          sortOrder: i + 1,
          isActive: true,
        },
        create: {
          pcBundleId: bundle.id,
          skuId: component.id,
          quantity: 1,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }

    seededBundles.push(bundle);
  }

  // Get branches for orders
  const branches = await prisma.branch.findMany({ take: 2 });
  const branchHn = branches[0] || { id: 1, name: 'Chi nhanh Ha Noi - Cau Giay' };
  const branchHcm = branches[1] || { id: 2, name: 'Chi nhanh TP. Ho Chi Minh - Quan 10' };

  // Seed 6 Orders across Kanban pipeline
  console.log('Seed 6 don hang trai dai 5 giai doan Kanban...');
  const orderDefs = [
    {
      id: DETERMINISTIC_IDS.ORDER_1,
      code: 'ELT-91024',
      status: OrderStatus.PENDING_PAYMENT,
      paymentMethod: PaymentMethod.QR,
      paymentState: PaymentState.UNPAID,
      fulfillmentMethod: FulfillmentMethod.DELIVERY,
      branch: branchHcm,
      subtotal: new Prisma.Decimal('45290000'),
      grandTotal: new Prisma.Decimal('45290000'),
      sku: vgas[0],
    },
    {
      id: DETERMINISTIC_IDS.ORDER_2,
      code: 'ELT-89820',
      status: OrderStatus.PREPARING_COMPONENTS,
      paymentMethod: PaymentMethod.QR,
      paymentState: PaymentState.PAID,
      fulfillmentMethod: FulfillmentMethod.PICKUP,
      branch: branchHn,
      subtotal: new Prisma.Decimal('18500000'),
      grandTotal: new Prisma.Decimal('18500000'),
      sku: cpus[0],
    },
    {
      id: DETERMINISTIC_IDS.ORDER_3,
      code: 'ELT-89552',
      status: OrderStatus.ASSEMBLING,
      paymentMethod: PaymentMethod.QR,
      paymentState: PaymentState.PAID,
      fulfillmentMethod: FulfillmentMethod.PICKUP,
      branch: branchHcm,
      subtotal: new Prisma.Decimal('52990000'),
      grandTotal: new Prisma.Decimal('52990000'),
      sku: vgas[1] || vgas[0],
    },
    {
      id: DETERMINISTIC_IDS.ORDER_4,
      code: 'ELT-88910',
      status: OrderStatus.READY_FOR_PICKUP,
      paymentMethod: PaymentMethod.QR,
      paymentState: PaymentState.PAID,
      fulfillmentMethod: FulfillmentMethod.PICKUP,
      branch: branchHcm,
      subtotal: new Prisma.Decimal('38900000'),
      grandTotal: new Prisma.Decimal('38900000'),
      sku: mainboards[0],
    },
    {
      id: DETERMINISTIC_IDS.ORDER_5,
      code: 'ELT-87621',
      status: OrderStatus.COMPLETED,
      paymentMethod: PaymentMethod.QR,
      paymentState: PaymentState.PAID,
      fulfillmentMethod: FulfillmentMethod.DELIVERY,
      branch: branchHcm,
      subtotal: new Prisma.Decimal('68500000'),
      grandTotal: new Prisma.Decimal('68500000'),
      sku: vgas[0],
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: DETERMINISTIC_IDS.ORDER_6,
      code: 'ELT-86510',
      status: OrderStatus.CANCELLED,
      paymentMethod: PaymentMethod.COD,
      paymentState: PaymentState.UNPAID,
      fulfillmentMethod: FulfillmentMethod.DELIVERY,
      branch: branchHn,
      subtotal: new Prisma.Decimal('12400000'),
      grandTotal: new Prisma.Decimal('12400000'),
      sku: rams[0],
      cancellationReason: 'Khach hang yeu cau huy de doi sang cau hinh Workstation',
      cancelledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  let completedOrderLineId: string | null = null;
  let completedOrderSkuId: number | null = null;
  let completedOrderTemplateId: number | null = null;

  for (const def of orderDefs) {
    const existingOrder = await prisma.order.findUnique({ where: { code: def.code } });
    const orderId = existingOrder ? existingOrder.id : def.id;

    const order = await prisma.order.upsert({
      where: { code: def.code },
      update: {
        status: def.status,
        paymentMethod: def.paymentMethod,
        fulfillmentMethod: def.fulfillmentMethod,
        fulfillmentBranchId: def.branch.id,
        subtotal: def.subtotal,
        grandTotal: def.grandTotal,
        cancellationReason: def.cancellationReason || null,
        completedAt: def.completedAt || null,
        cancelledAt: def.cancelledAt || null,
        branchSnapshot: { id: def.branch.id, name: def.branch.name },
        pricingSnapshot: { subtotal: def.subtotal.toString(), grandTotal: def.grandTotal.toString() },
      },
      create: {
        id: orderId,
        code: def.code,
        idempotencyKey: `idemp-seed-${def.code}`,
        customerId: customer1.id,
        fulfillmentBranchId: def.branch.id,
        fulfillmentMethod: def.fulfillmentMethod,
        paymentMethod: def.paymentMethod,
        status: def.status,
        subtotal: def.subtotal,
        grandTotal: def.grandTotal,
        receiverName: 'Nguyen Hoang Nam',
        receiverEmail: 'hoangnam.tech@gmail.com',
        receiverPhone: '0988234567',
        receiverEmailVerifiedAt: new Date(),
        receiverPhoneVerifiedAt: new Date(),
        deliveryAddressSnapshot: { address: '324 Su Van Hanh, Phuong 9, Quan 10, TP.HCM' },
        branchSnapshot: { id: def.branch.id, name: def.branch.name },
        pricingSnapshot: { subtotal: def.subtotal.toString(), grandTotal: def.grandTotal.toString() },
        cancellationReason: def.cancellationReason || null,
        completedAt: def.completedAt || null,
        cancelledAt: def.cancelledAt || null,
      },
    });

    // Seed OrderLine for this order
    const lineId = `00000000-0000-4000-d000-${def.code.replace('ELT-', '').padStart(12, '0')}`;
    const orderLine = await prisma.orderLine.upsert({
      where: { id: lineId },
      update: {
        skuId: def.sku.id,
        quantity: 1,
        unitPrice: def.subtotal,
        netAmount: def.subtotal,
      },
      create: {
        id: lineId,
        orderId: order.id,
        skuId: def.sku.id,
        lineType: SalesLineType.SKU,
        nameSnapshot: def.sku.productTemplate.name,
        skuSnapshot: def.sku.sku,
        quantity: 1,
        unitPrice: def.subtotal,
        netAmount: def.subtotal,
        sortOrder: 1,
      },
    });

    if (def.code === 'ELT-87621') {
      completedOrderLineId = orderLine.id;
      completedOrderSkuId = def.sku.id;
      completedOrderTemplateId = def.sku.productTemplate.id;
    }

    // Seed Payment record
    const paymentId = `00000000-0000-4000-e000-${def.code.replace('ELT-', '').padStart(12, '0')}`;
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        state: def.paymentState,
        method: def.paymentMethod,
        totalReceived: def.paymentState === PaymentState.PAID ? def.grandTotal : new Prisma.Decimal(0),
      },
      create: {
        id: paymentId,
        orderId: order.id,
        state: def.paymentState,
        method: def.paymentMethod,
        totalReceived: def.paymentState === PaymentState.PAID ? def.grandTotal : new Prisma.Decimal(0),
      },
    });

    // Seed OrderStatusHistory timeline
    const historyId = `00000000-0000-4000-f000-${def.code.replace('ELT-', '').padStart(12, '0')}`;
    await prisma.orderStatusHistory.upsert({
      where: { idempotencyKey: `history-seed-${def.code}` },
      update: {
        nextStatus: def.status,
      },
      create: {
        id: historyId,
        orderId: order.id,
        previousStatus: OrderStatus.PENDING_PAYMENT,
        nextStatus: def.status,
        reason: 'Khoi tao trang thai tien do theo pipeline Kanban',
        actorType: ActorType.SYSTEM,
        actorId: 'system-seed',
        idempotencyKey: `history-seed-${def.code}`,
      },
    });

    // Seed pickup OTP code for READY_FOR_PICKUP order
    if (def.code === 'ELT-88910') {
      const verificationId = '00000000-0000-4000-9000-000000088910';
      await prisma.verification.upsert({
        where: { id: verificationId },
        update: {
          value: '489-102',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        create: {
          id: verificationId,
          identifier: 'OTP_PICKUP_ELT-88910',
          value: '489-102',
          orderId: order.id,
          customerId: customer1.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Seed Verified Reviews for COMPLETED order
  console.log('Seed danh gia san pham duoc kiem dinh (Verified Reviews)...');
  if (completedOrderLineId && completedOrderSkuId && completedOrderTemplateId) {
    const reviewId = '00000000-0000-4000-a000-000000000001';
    await prisma.review.upsert({
      where: { orderLineId: completedOrderLineId },
      update: {
        rating: 5,
        text: 'San pham dong goi cuc ky can than voi 3 lop xop chong soc. Test nhiet do phong lanh 25 do C chay Furmark 30 phut chi dao dong 64-67 do C, quat em khong bi coil whine. Rat hai long voi dich vu cua EL-TECH.',
        isVisible: true,
      },
      create: {
        id: reviewId,
        customerId: customer1.id,
        productTemplateId: completedOrderTemplateId,
        skuId: completedOrderSkuId,
        orderId: DETERMINISTIC_IDS.ORDER_5,
        orderLineId: completedOrderLineId,
        rating: 5,
        text: 'San pham dong goi cuc ky can than voi 3 lop xop chong soc. Test nhiet do phong lanh 25 do C chay Furmark 30 phut chi dao dong 64-67 do C, quat em khong bi coil whine. Rat hai long voi dich vu cua EL-TECH.',
        isVisible: true,
      },
    });
  }

  console.log('Seed du lieu hoan tat thanh cong!');
}

seedDemoData()
  .catch((e) => {
    console.error('Loi khi seed du lieu demo:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
