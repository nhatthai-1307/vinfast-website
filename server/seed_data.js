const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/vinfast';

// ============ Car IDs (existing) ============
const CAR_IDS = {
  VF3: '6a535129b467872d071e4bf5',
  VF5: '6a535129b467872d071e4bf9',
  VF6: '6a535129b467872d071e4bfd',
  VF7: '6a535129b467872d071e4c00',
  VF8: '6a535129b467872d071e4c03',
  VF9: '6a535129b467872d071e4c06',
};

// ============ Existing User IDs ============
const ADMIN_ID = '6a535129b467872d071e4bef';
const STAFF_ID = '6a535129b467872d071e4bf1';
const CUSTOMER_IDS = [
  '6a535129b467872d071e4bf3',
  '6a5f1f26e35de636ff88564f',
  '6a71bd3eed28f98d1dd5578b',
  '6a71c43e46d0ccd0016206ee',
  '6a71c57346d0ccd001620718',
  '6a7bd9677753b0c58b1f029b',
];

// ============ Helper ============
function oid(id) { return new mongoose.Types.ObjectId(id); }
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pastDate(daysAgo) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  d.setHours(randBetween(8, 18), randBetween(0, 59));
  return d;
}
function futureDate(daysFromNow) {
  const d = new Date(); d.setDate(d.getDate() + daysFromNow);
  d.setHours(randBetween(8, 18), randBetween(0, 59));
  return d;
}

// ============ SEED DATA ============

// --- 5 thêm Users mới (khách hàng giả) ---
async function seedUsers(db) {
  const hash = await bcrypt.hash('user123', 10);
  const newUsers = [
    { name: 'Lê Thị Hồng Nhung', email: 'nhung.le@gmail.com', phone: '0901234567', role: 'customer' },
    { name: 'Võ Minh Tuấn', email: 'tuan.vo@gmail.com', phone: '0912345678', role: 'customer' },
    { name: 'Đặng Thùy Linh', email: 'linh.dang@gmail.com', phone: '0923456789', role: 'customer' },
    { name: 'Bùi Quốc Huy', email: 'huy.bui@gmail.com', phone: '0934567890', role: 'customer' },
    { name: 'Ngô Thanh Tùng', email: 'tung.ngo@gmail.com', phone: '0945678901', role: 'customer' },
  ];

  const inserted = [];
  for (const u of newUsers) {
    const exists = await db.collection('users').findOne({ email: u.email });
    if (!exists) {
      const res = await db.collection('users').insertOne({
        ...u, password: hash, avatar: '', favorites: [],
        refreshToken: '', isEmailConfirmed: true, otpCode: '', createdAt: pastDate(randBetween(10, 60)), updatedAt: new Date(),
      });
      inserted.push(res.insertedId.toString());
    } else {
      inserted.push(exists._id.toString());
    }
  }
  console.log(`✅ Users: ${inserted.length} seeded`);
  return inserted;
}

// --- 12 Orders (đơn đặt cọc xe) ---
async function seedOrders(db, extraUserIds) {
  const allCustomers = [...CUSTOMER_IDS, ...extraUserIds];
  const cars = Object.values(CAR_IDS);
  const showrooms = [
    'VinFast Showroom Quận 1, TP.HCM',
    'VinFast Showroom Quận 7, TP.HCM',
    'VinFast Showroom Hà Nội - Thanh Xuân',
    'VinFast Showroom Đà Nẵng',
    'VinFast Showroom Cần Thơ',
    'VinFast Showroom Bình Dương',
  ];
  const colors = ['Trắng Ngọc Trinh', 'Đen Huyền Bí', 'Xanh Lục Bảo', 'Đỏ Mystique', 'Bạc Ánh Trăng', 'Xám Elegance'];
  const names = ['Trần Văn Khách Hàng', 'Phạm Nguyễn Nhật Thái', 'Lê Thị Hồng Nhung', 'Võ Minh Tuấn', 'Đặng Thùy Linh', 'Bùi Quốc Huy', 'Ngô Thanh Tùng', 'Phạm Nhật Đăng', 'Hứa Văn Khang', 'Kim Khánh Duy', 'Nguyễn Thị Mai', 'Trần Quốc Bảo'];
  const emails = ['khachhang@gmail.com', 'nhatthai130705@gmail.com', 'nhung.le@gmail.com', 'tuan.vo@gmail.com', 'linh.dang@gmail.com', 'huy.bui@gmail.com', 'tung.ngo@gmail.com', 'phamdang@gmail.com', 'huakhang@gmail.com', 'kimkhanh@gmail.com', 'ngmai@gmail.com', 'quocbao@gmail.com'];
  const phones = ['0348732716', '0901234567', '0912345678', '0923456789', '0934567890', '0945678901', '0956789012', '0967890123', '0978901234', '0989012345', '0890123456', '0801234567'];
  const statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  const payStatuses = ['pending', 'paid', 'paid', 'paid', 'failed'];

  const orders = [];
  for (let i = 0; i < 12; i++) {
    const carId = cars[i % cars.length];
    const createdAt = pastDate(randBetween(1, 45));
    const status = statuses[i % statuses.length];
    orders.push({
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}${String(i).padStart(3, '0')}`,
      user: oid(allCustomers[i % allCustomers.length]),
      customerInfo: {
        name: names[i % names.length],
        email: emails[i % emails.length],
        phone: phones[i % phones.length],
        address: `${randBetween(1, 200)} Đường Nguyễn Huệ, Quận ${randBetween(1, 12)}, TP.HCM`,
        idCard: `0${randBetween(10, 99)}${randBetween(100000, 999999)}`,
      },
      car: oid(carId),
      selectedColor: randItem(colors),
      purchaseOption: i % 3 === 0 ? 'rent-battery' : 'buy-battery',
      paymentMethod: i % 2 === 0 ? 'installment' : 'full-payment',
      installmentDetails: i % 2 === 0 ? {
        prepaidAmount: randBetween(100, 500) * 1000000,
        months: randItem([12, 24, 36, 48, 60, 72]),
        bank: randItem(['Vietcombank', 'Techcombank', 'TPBank', 'VPBank', 'BIDV']),
        monthlyPayment: randBetween(5, 25) * 1000000,
      } : undefined,
      depositAmount: 10000000,
      paymentStatus: payStatuses[i % payStatuses.length],
      orderStatus: status,
      showroom: randItem(showrooms),
      createdAt,
      updatedAt: createdAt,
    });
  }
  await db.collection('orders').deleteMany({});
  await db.collection('orders').insertMany(orders);
  console.log(`✅ Orders: ${orders.length} seeded`);
}

// --- 10 Test Drives ---
async function seedTestDrives(db, extraUserIds) {
  const allCustomers = [...CUSTOMER_IDS, ...extraUserIds];
  const cars = Object.values(CAR_IDS);
  const showrooms = [
    'VinFast Showroom Quận 1, TP.HCM',
    'VinFast Showroom Quận 7, TP.HCM',
    'VinFast Showroom Hà Nội - Thanh Xuân',
    'VinFast Showroom Đà Nẵng',
  ];
  const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'];
  const statuses = ['pending', 'approved', 'completed', 'cancelled'];
  const names = ['Trần Văn Khách Hàng', 'Phạm Nguyễn Nhật Thái', 'Lê Thị Hồng Nhung', 'Võ Minh Tuấn', 'Đặng Thùy Linh', 'Bùi Quốc Huy', 'Ngô Thanh Tùng', 'Phạm Nhật Đăng', 'Hứa Văn Khang', 'Kim Khánh Duy'];
  const emails = ['khachhang@gmail.com', 'nhatthai130705@gmail.com', 'nhung.le@gmail.com', 'tuan.vo@gmail.com', 'linh.dang@gmail.com', 'huy.bui@gmail.com', 'tung.ngo@gmail.com', 'phamdang@gmail.com', 'huakhang@gmail.com', 'kimkhanh@gmail.com'];
  const phones = ['0348732716', '0901234567', '0912345678', '0923456789', '0934567890', '0945678901', '0956789012', '0967890123', '0978901234', '0989012345'];

  const drives = [];
  for (let i = 0; i < 10; i++) {
    const status = statuses[i % statuses.length];
    const createdAt = pastDate(randBetween(1, 30));
    drives.push({
      user: oid(allCustomers[i % allCustomers.length]),
      customerInfo: {
        name: names[i],
        email: emails[i],
        phone: phones[i],
      },
      car: oid(cars[i % cars.length]),
      date: i < 5 ? pastDate(randBetween(1, 14)) : futureDate(randBetween(1, 14)),
      timeSlot: randItem(timeSlots),
      showroom: randItem(showrooms),
      status,
      assignedStaff: status === 'approved' || status === 'completed' ? oid(STAFF_ID) : undefined,
      createdAt,
      updatedAt: createdAt,
    });
  }
  await db.collection('testdrives').deleteMany({});
  await db.collection('testdrives').insertMany(drives);
  console.log(`✅ TestDrives: ${drives.length} seeded`);
}

// --- 8 Rentals ---
async function seedRentals(db, extraUserIds) {
  const allCustomers = [...CUSTOMER_IDS, ...extraUserIds];
  const cars = Object.values(CAR_IDS);
  const colors = ['Trắng Ngọc Trinh', 'Đen Huyền Bí', 'Xanh Lục Bảo', 'Đỏ Mystique', 'Bạc Ánh Trăng'];
  const locations = ['VinFast Showroom Quận 1', 'VinFast Showroom Quận 7', 'VinFast Showroom Hà Nội', 'VinFast Showroom Đà Nẵng'];
  const statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
  const pricesPerDay = [800000, 1000000, 1200000, 1600000, 2000000, 2500000];
  const names = ['Lê Thị Hồng Nhung', 'Võ Minh Tuấn', 'Đặng Thùy Linh', 'Bùi Quốc Huy', 'Ngô Thanh Tùng', 'Trần Văn Khách Hàng', 'Phạm Nhật Đăng', 'Kim Khánh Duy'];
  const emails = ['nhung.le@gmail.com', 'tuan.vo@gmail.com', 'linh.dang@gmail.com', 'huy.bui@gmail.com', 'tung.ngo@gmail.com', 'khachhang@gmail.com', 'phamdang@gmail.com', 'kimkhanh@gmail.com'];
  const phones = ['0901234567', '0912345678', '0923456789', '0934567890', '0945678901', '0348732716', '0967890123', '0989012345'];

  const rentals = [];
  for (let i = 0; i < 8; i++) {
    const totalDays = randBetween(1, 7);
    const pricePerDay = pricesPerDay[i % pricesPerDay.length];
    const pickupDate = i < 4 ? pastDate(randBetween(1, 20)) : futureDate(randBetween(1, 10));
    const returnDate = new Date(pickupDate); returnDate.setDate(returnDate.getDate() + totalDays);
    const status = statuses[i % statuses.length];
    const createdAt = pastDate(randBetween(1, 25));

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let rentalNum = 'RENT-';
    for (let j = 0; j < 8; j++) rentalNum += chars[Math.floor(Math.random() * chars.length)];

    rentals.push({
      user: oid(allCustomers[i % allCustomers.length]),
      car: oid(cars[i % cars.length]),
      customerInfo: {
        name: names[i],
        email: emails[i],
        phone: phones[i],
        idCard: `0${randBetween(10, 99)}${randBetween(100000, 999999)}`,
        address: `${randBetween(1, 300)} Đường Lý Tự Trọng, Quận ${randBetween(1, 12)}, TP.HCM`,
      },
      pickupDate,
      returnDate,
      totalDays,
      pricePerDay,
      totalAmount: totalDays * pricePerDay,
      withDriver: i % 3 === 0,
      deliveryAddress: i % 2 === 0 ? `${randBetween(1, 200)} Nguyễn Trãi, TP.HCM` : '',
      pickupLocation: randItem(locations),
      selectedColor: randItem(colors),
      status,
      rentalNumber: rentalNum,
      depositPaid: 5000000,
      paymentGateway: randItem(['VNPay', 'MoMo', 'Chuyển khoản']),
      discountAmount: i % 4 === 0 ? 500000 : 0,
      notes: i % 3 === 0 ? 'Khách yêu cầu giao xe tận nơi' : '',
      createdAt,
      updatedAt: createdAt,
    });
  }
  await db.collection('rentals').deleteMany({});
  await db.collection('rentals').insertMany(rentals);
  console.log(`✅ Rentals: ${rentals.length} seeded`);
}

// --- 15 Reviews ---
async function seedReviews(db, extraUserIds) {
  const allCustomers = [...CUSTOMER_IDS, ...extraUserIds];
  const cars = Object.values(CAR_IDS);
  const comments = [
    'Xe chạy êm, tiết kiệm chi phí nhiên liệu rất nhiều so với xe xăng. Rất hài lòng!',
    'Thiết kế hiện đại, nội thất sang trọng. Con gái tôi rất thích màu hồng của VF 3.',
    'ADAS hoạt động rất tốt, phanh tự động đã cứu tôi một lần trên cao tốc.',
    'Pin đi được xa hơn mong đợi. Sạc nhanh cũng tiện, chỉ 30 phút là đầy 70%.',
    'Giá cả hợp lý cho một chiếc SUV điện. Chất lượng tương đương xe ngoại nhập.',
    'Khoang xe rộng rãi, phù hợp gia đình có trẻ nhỏ. Cốp xe chứa được nhiều đồ.',
    'Động cơ mạnh mẽ, tăng tốc nhanh. Lái xe trên cao tốc rất sướng!',
    'Dịch vụ hậu mãi của VinFast rất tốt. Nhân viên tư vấn nhiệt tình.',
    'Trải nghiệm lái thử rất ấn tượng. Quyết định đặt cọc luôn sau khi lái thử.',
    'Camera 360 và cảm biến đỗ xe rất hữu ích cho người mới lái.',
    'Xe điện là tương lai, VinFast đang đi đúng hướng. Ủng hộ hàng Việt!',
    'Ghế massage trên VF 9 quá tuyệt vời. Ngồi lái cả ngày không mỏi.',
    'Hệ thống giải trí trên xe rất phong phú. Màn hình lớn, âm thanh hay.',
    'Tiết kiệm được 3-4 triệu tiền xăng mỗi tháng kể từ khi chuyển sang xe điện.',
    'Thiết kế phi đối xứng của VF 7 rất độc đáo, thu hút mọi ánh nhìn trên phố.',
  ];

  const reviews = [];
  for (let i = 0; i < 15; i++) {
    reviews.push({
      user: oid(allCustomers[i % allCustomers.length]),
      car: oid(cars[i % cars.length]),
      rating: randBetween(4, 5),
      comment: comments[i],
      images: [],
      createdAt: pastDate(randBetween(1, 60)),
      updatedAt: new Date(),
    });
  }
  await db.collection('reviews').deleteMany({});
  await db.collection('reviews').insertMany(reviews);
  console.log(`✅ Reviews: ${reviews.length} seeded`);
}

// --- 6 Promotions ---
async function seedPromotions(db) {
  const promos = [
    { code: 'VINFAST50', discountAmount: 50000000, discountPercentage: 0, expiryDate: futureDate(60), isActive: true, description: 'Giảm 50 triệu khi đặt cọc VF 8 hoặc VF 9' },
    { code: 'SUMMER2026', discountAmount: 30000000, discountPercentage: 0, expiryDate: futureDate(30), isActive: true, description: 'Ưu đãi hè 2026 - Giảm 30 triệu cho tất cả dòng xe' },
    { code: 'FREESAC', discountAmount: 0, discountPercentage: 100, expiryDate: futureDate(90), isActive: true, description: 'Miễn phí sạc pin 1 năm đầu tiên' },
    { code: 'VF3HOT', discountAmount: 15000000, discountPercentage: 0, expiryDate: futureDate(45), isActive: true, description: 'Giảm 15 triệu khi đặt cọc VF 3 - Số lượng có hạn!' },
    { code: 'THUE10', discountAmount: 0, discountPercentage: 10, expiryDate: futureDate(20), isActive: true, description: 'Giảm 10% phí thuê xe cho đơn thuê từ 3 ngày' },
    { code: 'EXPIRED01', discountAmount: 20000000, discountPercentage: 0, expiryDate: pastDate(10), isActive: false, description: 'Chương trình đã kết thúc - Giảm 20 triệu Tết 2026' },
  ];

  for (const p of promos) {
    p.createdAt = pastDate(randBetween(5, 90));
    p.updatedAt = new Date();
  }
  await db.collection('promotions').deleteMany({});
  await db.collection('promotions').insertMany(promos);
  console.log(`✅ Promotions: ${promos.length} seeded`);
}

// ============ MAIN ============
async function main() {
  console.log('🚀 Bắt đầu seed dữ liệu ảo cho Admin Dashboard...\n');

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const extraUserIds = await seedUsers(db);
  await seedOrders(db, extraUserIds);
  await seedTestDrives(db, extraUserIds);
  await seedRentals(db, extraUserIds);
  await seedReviews(db, extraUserIds);
  await seedPromotions(db);

  console.log('\n🎉 HOÀN TẤT! Tất cả dữ liệu ảo đã được tạo thành công.');
  console.log('👉 Truy cập http://localhost:5173/admin để xem dữ liệu.');

  await mongoose.disconnect();
}

main().catch(console.error);
