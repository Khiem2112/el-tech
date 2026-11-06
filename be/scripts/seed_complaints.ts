import { prisma } from '../src/lib/prisma.js';

async function seedComplaints(): Promise<void> {
  const existingCount = await prisma.complaint.count();
  if (existingCount > 0) {
    console.info(`Complaints already seeded. Total: ${existingCount}`);
    return;
  }

  const sampleOrders = await prisma.order.findMany({
    take: 3,
    select: {
      id: true,
      code: true,
      customerId: true,
      receiverName: true,
      receiverPhone: true,
      receiverEmail: true,
    },
  });

  const order1 = sampleOrders[0];
  const order2 = sampleOrders[1];
  const order3 = sampleOrders[2];

  const complaintsData = [
    {
      code: 'KN-8412',
      customerName: order1 ? order1.receiverName : 'Nguyễn Hoàng Nam',
      customerPhone: order1 ? order1.receiverPhone : '0988234567',
      customerEmail: order1 ? order1.receiverEmail : 'hoangnam.tech@gmail.com',
      orderId: order1 ? order1.id : null,
      orderCode: order1 ? order1.code : 'EL-20260301',
      serialNumber: 'SN-RTX4080-8812',
      category: 'Đổi trả linh kiện lỗi (Bảo hành)',
      status: 'RECEIVED' as const,
      title: 'Quạt tản nhiệt GPU phát tiếng kêu rè rè khi tải nặng',
      description: 'Card màn hình RTX 4080 Super vừa mua 3 ngày trước, khi chạy Render đồ họa hoặc chơi game nhiệt độ lên 75 độ quạt số 2 có tiếng kêu cọ sát cơ học.',
      attachments: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80'],
      customerId: order1 ? order1.customerId : null,
    },
    {
      code: 'KN-8413',
      customerName: order2 ? order2.receiverName : 'Lê Hoàng Long',
      customerPhone: order2 ? order2.receiverPhone : '0912345678',
      customerEmail: order2 ? order2.receiverEmail : 'hoanglong.le@gmail.com',
      orderId: order2 ? order2.id : null,
      orderCode: order2 ? order2.code : 'EL-20260302',
      serialNumber: null,
      category: 'Tư vấn kỹ thuật / Lắp ráp',
      status: 'RECEIVED' as const,
      title: 'Chưa nhận được key bản quyền phần mềm kèm theo máy',
      description: 'Hóa đơn mua dàn PC Workstation có ghi tặng kèm gói bản quyền phần mềm đồ họa nhưng trong thùng máy chỉ có phụ kiện, chưa có phong bì thư mã kích hoạt.',
      attachments: [],
      customerId: order2 ? order2.customerId : null,
    },
    {
      code: 'KN-8414',
      customerName: order3 ? order3.receiverName : 'Trần Quốc Bảo',
      customerPhone: order3 ? order3.receiverPhone : '0977654321',
      customerEmail: order3 ? order3.receiverEmail : 'baotran.pc@gmail.com',
      orderId: order3 ? order3.id : null,
      orderCode: order3 ? order3.code : 'EL-20260303',
      serialNumber: 'SN-NZXT-H9-019',
      category: 'Giao nhận & Vận chuyển',
      status: 'PROCESSING' as const,
      title: 'Vết xước mép kính cường lực thùng case',
      description: 'Khi shipper giao máy tới nhà kiểm tra ngoại quan có vết cấn nhẹ ở góc kính bên hông case. Kỹ thuật viên giao hàng đã đồng kiểm và ký biên bản giao nhận.',
      resolutionNote: 'Đã hẹn khách ngày mai chuyên viên mang tấm kính cường lực nguyên seal mới tới lắp thay thế tận nhà.',
      resolvedBy: 'Kỹ thuật viên Nguyễn Tuấn',
      attachments: [],
      customerId: order3 ? order3.customerId : null,
    },
    {
      code: 'KN-8415',
      customerName: 'Phạm Thu Hằng',
      customerPhone: '0908889999',
      customerEmail: 'hangpham.design@outlook.com',
      orderId: null,
      orderCode: 'EL-20260299',
      serialNumber: 'SN-ASUS-Z790-991',
      category: 'Đổi trả linh kiện lỗi (Bảo hành)',
      status: 'PROCESSING' as const,
      title: 'Bo mạch chủ không nhận khe RAM số 4',
      description: 'Cắm 4 thanh RAM cùng kit nhưng máy chỉ nhận 3 thanh kênh A và B1, khe B2 không nhận dù đã update BIOS lên phiên bản mới nhất.',
      resolutionNote: 'Tiếp nhận linh kiện tại Showroom, đang chuyển phòng kiểm định bo mạch chủ test xung tải 24h.',
      resolvedBy: 'Kỹ thuật viên Lê Minh',
      attachments: [],
      customerId: null,
    },
    {
      code: 'KN-8416',
      customerName: 'Vũ Đức Thịnh',
      customerPhone: '0933221100',
      customerEmail: 'thinh.vu@enterprise.vn',
      orderId: null,
      orderCode: 'EL-20260250',
      serialNumber: 'SN-CORSAIR-64GB-44',
      category: 'Đổi trả linh kiện lỗi (Bảo hành)',
      status: 'RESOLVED' as const,
      title: 'Đổi mới kit RAM DDR5 6400MHz',
      description: 'Thanh RAM bị lỗi XMP profile làm màn hình xanh khi render nặng. Yêu cầu đổi mới sản phẩm nguyên seal khác.',
      resolutionNote: 'Đã hoàn tất đổi mới kit RAM nguyên hộp cho khách hàng tại chi nhánh và chạy thử Prime95 ổn định trong 2 giờ.',
      resolvedBy: 'Trưởng bộ phận kỹ thuật',
      resolvedAt: new Date(),
      attachments: [],
      customerId: null,
    },
    {
      code: 'KN-8417',
      customerName: 'Hoàng Anh Quân',
      customerPhone: '0944556677',
      customerEmail: 'quan.hoang@gmail.com',
      orderId: null,
      orderCode: 'EL-20260233',
      serialNumber: null,
      category: 'Yêu cầu hoàn tiền',
      status: 'RESOLVED' as const,
      title: 'Hoàn tiền chuyển khoản đơn hàng thanh toán thừa',
      description: 'Khách hàng thao tác quét mã VietQR hai lần cho cùng một mã đơn hàng.',
      resolutionNote: 'Kế toán tài chính đã kiểm tra sao kê ngân hàng và thực hiện lệnh hoàn trả tiền dư về tài khoản nguồn.',
      resolvedBy: 'Kế toán viên Trần Mai',
      resolvedAt: new Date(),
      attachments: [],
      customerId: null,
    },
    {
      code: 'KN-8418',
      customerName: 'Nguyễn Văn Đạt',
      customerPhone: '0966778899',
      customerEmail: 'dat.nguyen@yahoo.com',
      orderId: null,
      orderCode: 'EL-20260110',
      serialNumber: 'SN-MSI-MAG-2023',
      category: 'Khác',
      status: 'DISMISSED' as const,
      title: 'Yêu cầu đổi mới bàn phím cơ bị đổ nước ngọt',
      description: 'Bàn phím cơ bị đổ cà phê lên bảng mạch gây liệt phím sau 6 tháng sử dụng, yêu cầu cửa hàng đổi mới 1-1 miễn phí.',
      resolutionNote: 'Từ chối đổi mới do lỗi người dùng làm đổ chất lỏng gây chập mạch mạch in, không thuộc phạm vi bảo hành nhà sản xuất. Đã giải thích chính sách và báo giá dịch vụ vệ sinh mạch.',
      resolvedBy: 'Chuyên viên CSKH',
      resolvedAt: new Date(),
      attachments: [],
      customerId: null,
    },
  ];

  for (const item of complaintsData) {
    await prisma.complaint.create({
      data: item,
    });
  }

  console.info(`Seeded ${complaintsData.length} complaints successfully.`);
}

seedComplaints()
  .catch((err) => {
    console.error('Error seeding complaints:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

