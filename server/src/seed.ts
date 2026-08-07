import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Car from './models/Car';
import Order from './models/Order';
import TestDrive from './models/TestDrive';
import Review from './models/Review';
import Promotion from './models/Promotion';

dotenv.config();

const carsData = [
  {
    name: 'VinFast VF 3',
    slug: 'vf-3',
    price: 322000000,
    batteryRentPrice: 900000,
    category: 'Mini',
    seats: 4,
    range: 210,
    power: 43,
    description: 'VF 3 là mẫu xe điện cỡ nhỏ, cá tính, năng động và đột phá nhất của VinFast. Thiết kế vuông vức mạnh mẽ mang phong cách mini-SUV, tối ưu cho nhu cầu di chuyển trong đô thị đông đúc.',
    videoUrl: 'https://www.youtube.com/embed/Q43tK-f9R08',
    isFeatured: true,
    isNewest: true,
    stock: 25,
    colors: [
      {
        name: 'Vàng Năng Động (Zenith Yellow)',
        code: '#EAB308',
        images: ['/assets/cars/vf3_yellow.png']
      },
      {
        name: 'Xanh Lá Cá Tính (Jungle Green)',
        code: '#15803D',
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80']
      },
      {
        name: 'Trắng Sang Trọng',
        code: '#FFFFFF',
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80']
      }
    ],
    // 12 spin images for 360 viewer simulation
    images360: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      engine: 'Động cơ điện đơn (cầu sau)',
      batteryType: 'LFP',
      batteryCapacity: '18.6 kWh',
      chargingTime: '36 phút (10-70%)',
      torque: '110 Nm',
      acceleration: '19.3 s',
      airbags: 1,
      adas: ['Cảnh báo lệch làn', 'Hỗ trợ phanh khẩn cấp', 'Camera lùi'],
      dimensions: '3.190 x 1.679 x 1.622 mm',
      groundClearance: '191 mm'
    }
  },
  {
    name: 'VinFast VF 5 Plus',
    slug: 'vf-5',
    price: 468000000,
    batteryRentPrice: 1600000,
    category: 'A-SUV',
    seats: 5,
    range: 326,
    power: 134,
    description: 'VF 5 Plus mở ra kỷ nguyên di chuyển xanh cho số đông. Mẫu SUV cỡ A linh hoạt, tràn ngập công nghệ hiện đại, mức giá tối ưu và màu sắc đa dạng bật cá tính chủ sở hữu.',
    videoUrl: 'https://www.youtube.com/embed/n3vXFhT5_3k',
    isFeatured: true,
    isNewest: false,
    stock: 18,
    colors: [
      {
        name: 'Xanh Dương (VinFast Blue)',
        code: '#103F91',
        images: ['/assets/cars/vf5_blue.png']
      },
      {
        name: 'Cam Cá Tính (Orange)',
        code: '#EA580C',
        images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80']
      },
      {
        name: 'Đỏ Năng Động (Crimson)',
        code: '#DC2626',
        images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80']
      }
    ],
    images360: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      engine: 'Động cơ điện đơn (cầu trước)',
      batteryType: 'LFP',
      batteryCapacity: '37.23 kWh',
      chargingTime: '30 phút (10-70%)',
      torque: '135 Nm',
      acceleration: '10.9 s',
      airbags: 6,
      adas: ['Giám sát hành trình', 'Cảnh báo điểm mù', 'Cảnh báo giao thông phía sau', 'Hỗ trợ đỗ xe'],
      dimensions: '3.965 x 1.720 x 1.580 mm',
      groundClearance: '182 mm'
    }
  },
  {
    name: 'VinFast VF 6',
    slug: 'vf-6',
    price: 675000000,
    batteryRentPrice: 1800000,
    category: 'B-SUV',
    seats: 5,
    range: 399,
    power: 201,
    description: 'Đỉnh cao phong cách thiết kế từ studio nổi tiếng Torino Design (Ý). VF 6 là chiếc xe gia đình cỡ nhỏ lý tưởng với đường cong tinh tế kết hợp không gian nội thất rộng rãi bất ngờ.',
    videoUrl: 'https://www.youtube.com/embed/n3vXFhT5_3k',
    isFeatured: false,
    isNewest: true,
    stock: 12,
    colors: [
      {
        name: 'Bạc Đẳng Cấp (Silver)',
        code: '#9CA3AF',
        images: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80']
      },
      {
        name: 'Đen Huyền Bí (Black)',
        code: '#111827',
        images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80']
      }
    ],
    images360: [
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      engine: 'Động cơ điện đơn (cầu trước)',
      batteryType: 'LFP (Gotion)',
      batteryCapacity: '59.6 kWh',
      chargingTime: '30 phút (10-70%)',
      torque: '310 Nm',
      acceleration: '8.5 s',
      airbags: 8,
      adas: ['Hỗ trợ lái trên đường cao tốc', 'Hỗ trợ giữ làn tự động', 'Nhận diện biển báo giao thông', 'Phanh tự động khẩn cấp'],
      dimensions: '4.238 x 1.820 x 1.594 mm',
      groundClearance: '170 mm'
    }
  },
  {
    name: 'VinFast VF 7',
    slug: 'vf-7',
    price: 850000000,
    batteryRentPrice: 2200000,
    category: 'C-SUV',
    seats: 5,
    range: 431,
    power: 349,
    description: 'VF 7 sở hữu ngôn ngữ thiết kế vũ trụ phi đối xứng đột phá cực kỳ cá tính được chấp bút bởi studio Pininfarina danh tiếng. Sức mạnh ấn tượng vượt trội phân khúc mang lại cảm xúc phấn khích phấn khởi lái xe đích thực.',
    videoUrl: 'https://www.youtube.com/embed/n3vXFhT5_3k',
    isFeatured: true,
    isNewest: false,
    stock: 14,
    colors: [
      {
        name: 'Xám Tương Lai (Gray)',
        code: '#4B5563',
        images: ['/assets/cars/vf7_grey.png']
      },
      {
        name: 'Xanh Rêu Sành Điệu (Deep Green)',
        code: '#14532D',
        images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80']
      }
    ],
    images360: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      engine: 'Động cơ điện kép (AWD)',
      batteryType: 'NMC',
      batteryCapacity: '75.3 kWh',
      chargingTime: '26 phút (10-70%)',
      torque: '500 Nm',
      acceleration: '5.8 s',
      airbags: 8,
      adas: ['Hỗ trợ kẹt xe lái bán tự động', 'Tự động bám đuôi theo xe trước', 'Cảnh báo tiền va chạm', 'Đỗ xe thông minh điều khiển từ xa'],
      dimensions: '4.545 x 1.890 x 1.635 mm',
      groundClearance: '190 mm'
    }
  },
  {
    name: 'VinFast VF 8',
    slug: 'vf-8',
    price: 1090000000,
    batteryRentPrice: 2900000,
    category: 'D-SUV',
    seats: 5,
    range: 471,
    power: 402,
    description: 'Dòng xe SUV điện toàn cầu đầu tiên của VinFast. Sở hữu thiết kế kết hợp mềm mại quyến rũ của phong cách sedan và cứng cáp cơ bắp của chiếc SUV truyền thống. Đạt chuẩn an toàn 5 sao hàng đầu thế giới.',
    videoUrl: 'https://www.youtube.com/embed/n3vXFhT5_3k',
    isFeatured: true,
    isNewest: false,
    stock: 10,
    colors: [
      {
        name: 'Trắng Ngọc Trai (Brahminy White)',
        code: '#F9FAFB',
        images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80']
      },
      {
        name: 'Xanh VinFast (VinFast Blue)',
        code: '#103F91',
        images: ['https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80']
      }
    ],
    images360: [
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      engine: 'Động cơ điện kép (AWD)',
      batteryType: 'Lithium-ion',
      batteryCapacity: '87.7 kWh',
      chargingTime: '24 phút (10-70%)',
      torque: '620 Nm',
      acceleration: '5.5 s',
      airbags: 11,
      adas: ['Hỗ trợ di chuyển khi ùn tắc', 'Hỗ trợ lái trên cao tốc', 'Kiểm soát hành trình thích ứng', 'Cảnh báo va chạm trước sau', 'Trợ lý ảo Alexa/VinFast'],
      dimensions: '4.750 x 1.934 x 1.667 mm',
      groundClearance: '175 mm'
    }
  },
  {
    name: 'VinFast VF 9',
    slug: 'vf-9',
    price: 1560000000,
    batteryRentPrice: 3500000,
    category: 'E-SUV',
    seats: 7,
    range: 626,
    power: 402,
    description: 'Dòng SUV điện Full-size hạng sang tầm cỡ chủ tịch của VinFast. Thiết kế bề thế phong cách phi thuyền sang trọng đẳng cấp kết hợp màn hình HUD hiện đại, ghế thương gia bọc da cao cấp cùng tùy chọn massage sưởi thông minh.',
    videoUrl: 'https://www.youtube.com/embed/n3vXFhT5_3k',
    isFeatured: true,
    isNewest: false,
    stock: 8,
    colors: [
      {
        name: 'Xanh Hoàng Gia (Imperial Blue)',
        code: '#103F91',
        images: ['/assets/cars/vf9_blue.png']
      },
      {
        name: 'Vàng Cát Sang Trọng',
        code: '#D4AF37',
        images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80']
      }
    ],
    images360: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      engine: 'Động cơ điện kép (AWD)',
      batteryType: 'Lithium-ion',
      batteryCapacity: '123 kWh',
      chargingTime: '35 phút (10-70%)',
      torque: '620 Nm',
      acceleration: '6.5 s',
      airbags: 11,
      adas: ['Trợ lý lái xe nâng cao ADAS Level 2+', 'Hệ thống gọi cứu hộ khẩn cấp SOS', 'Phanh tự động thích ứng', 'Tránh đâm va đỗ xe tự động'],
      dimensions: '5.118 x 2.070 x 1.696 mm',
      groundClearance: '189 mm'
    }
  }
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vinfast';
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Car.deleteMany();
    await Order.deleteMany();
    await TestDrive.deleteMany();
    await Review.deleteMany();
    await Promotion.deleteMany();

    console.log('Cleared existing collections!');

    // Create Admin User
    const adminUser = new User({
      name: 'VinFast Admin System',
      email: 'admin@gmail.com',
      password: 'admin123', // Will be hashed via pre-save hook
      role: 'admin',
      phone: '0988777999',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    });
    await adminUser.save();

    // Create Consultant Staff
    const staffUser = new User({
      name: 'Nguyễn Văn Tư Vấn',
      email: 'staff@gmail.com',
      password: 'staff123',
      role: 'staff',
      phone: '0912345678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    });
    await staffUser.save();

    // Create Customer User
    const customerUser = new User({
      name: 'Trần Văn Khách Hàng',
      email: 'user@gmail.com',
      password: 'user123',
      role: 'customer',
      phone: '0901234567',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
    });
    await customerUser.save();

    console.log('Users Seeded (Admin, Staff, Customer)');

    // Seed Cars
    const seededCars = await Car.insertMany(carsData);
    console.log('Cars Database Seeded successfully!');

    // Seed some mock reviews to look professional
    await Review.create([
      {
        user: customerUser._id,
        car: seededCars[1]._id, // VF5
        rating: 5,
        comment: 'Tôi đã chạy VF 5 được 6 tháng, xe chạy bốc, chi phí sạc siêu rẻ so với xe xăng. Lựa chọn tuyệt vời cho gia đình di chuyển đô thị!',
      },
      {
        user: customerUser._id,
        car: seededCars[4]._id, // VF8
        rating: 5,
        comment: 'VF 8 chạy cực kỳ đầm chắc, hệ thống tự lái ADAS rất thông minh trên cao tốc. Thiết kế sang trọng!',
      }
    ]);
    console.log('Product Reviews Seeded!');

    // Seed Vouchers
    await Promotion.create([
      {
        code: 'PINXANH2026',
        discountAmount: 10000000,
        expiryDate: new Date('2027-12-31'),
        description: 'Voucher VinFast Xanh tặng 10.000.000đ khi đặt cọc trực tuyến xe điện.'
      },
      {
        code: 'VF5PERCENT',
        discountPercentage: 5,
        expiryDate: new Date('2027-12-31'),
        description: 'Mã giảm giá 5% tổng số tiền cọc cho xe điện.'
      }
    ]);
    console.log('Promotions & Vouchers Seeded!');

    console.log('====== ALL DATABASE SEEDING COMPLETED ======');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
