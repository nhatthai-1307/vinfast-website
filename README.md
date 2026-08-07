# 🚗 VinFast Electric Car - Hệ Thống Thương Mại Điện Tử Xe Điện

Dự án website bán xe ô tô điện **VinFast** Fullstack hoàn chỉnh dành cho đồ án chuyên ngành và khóa luận.

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| **Frontend** | ReactJS 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS 3 (VinFast Premium Theme) |
| **State Management** | Zustand |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Backend** | Node.js + Express.js + TypeScript |
| **Database** | MongoDB + Mongoose |
| **Realtime** | Socket.io |
| **Authentication** | JWT (Access Token + Refresh Token) |
| **Email** | Nodemailer (Mock mode) |

---

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Yêu cầu hệ thống

- **Node.js** >= 18.x
- **MongoDB** (local hoặc MongoDB Atlas)
- **npm** >= 9.x

### 2. Cài đặt MongoDB

Bạn có thể dùng MongoDB cục bộ (cài tại https://www.mongodb.com/try/download/community) hoặc kết nối MongoDB Atlas (free tier). Mặc định dự án kết nối `mongodb://127.0.0.1:27017/vinfast`.

### 3. Cài đặt Backend (Server)

```bash
# Chuyển vào thư mục server
cd server

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường (tùy chỉnh file .env nếu cần)
# Mặc định đã có cấu hình phù hợp cho môi trường local

# Import dữ liệu mẫu (Seed database)
npm run seed

# Khởi động server development
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

### 4. Cài đặt Frontend (Client)

Mở terminal mới:

```bash
# Chuyển vào thư mục client
cd client

# Cài đặt dependencies
npm install

# Khởi động client development
npm run dev
```

Client sẽ chạy tại: **http://localhost:5173**

---

## 🔑 Tài khoản Demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| **Admin** | admin@gmail.com | admin123 |
| **Nhân viên** | staff@gmail.com | staff123 |
| **Khách hàng** | user@gmail.com | user123 |

---

## 📁 Cấu trúc thư mục

```
BanOToDien/
├── client/                  # Frontend React + Vite + TypeScript
│   └── src/
│       ├── components/      # Navbar, Footer, ChatbotWidget, RealtimeListener
│       ├── layouts/         # MainLayout, AdminLayout
│       ├── pages/           # Tất cả trang khách hàng và Admin
│       │   └── admin/       # AdminDashboard, AdminCars, AdminOrders...
│       ├── services/        # Axios API client có JWT interceptors
│       ├── store/           # Zustand stores (Auth, Compare, Cart)
│       └── App.tsx          # React Router DOM routing
│
└── server/                  # Backend Node.js + Express + TypeScript
    └── src/
        ├── config/          # Kết nối MongoDB
        ├── controllers/     # Logic xử lý (Auth, Car, Order, TestDrive, Review, Dashboard)
        ├── middleware/       # JWT Auth & Error Handler
        ├── models/          # Mongoose Schemas (User, Car, Order, TestDrive, Review, Promotion)
        ├── routes/          # Express Routers
        ├── utils/           # sendEmail, token helpers
        ├── seed.ts          # Script import dữ liệu mẫu
        └── server.ts        # Khởi động HTTP server + Socket.io
```

---

## 🌟 Tính năng nổi bật

### Dành cho khách hàng
- 🏠 **Trang chủ** cao cấp với banner hero, danh sách xe nổi bật, đánh giá khách hàng
- 🚗 **Danh sách xe** VF3, VF5, VF6, VF7, VF8, VF9 với bộ lọc thông minh (giá, phân khúc, chỗ ngồi)
- 🔄 **Xem xe 360 độ** - kéo chuột xoay quanh xe
- 🎨 **Chọn màu xe** tương tác trực quan
- ⚖️ **So sánh xe** tối đa 3 dòng xe cạnh nhau
- 💰 **Tính toán trả góp** chi tiết từng tháng với lịch trình dư nợ giảm dần
- 📍 **Bản đồ showroom & trạm sạc** trên toàn quốc
- 💳 **Đặt cọc online** với mã QR thanh toán và thông báo realtime
- 🤖 **AI Chatbot** tư vấn xe thông minh 24/7
- 📊 **Dashboard cá nhân** - theo dõi đơn cọc và lịch lái thử

### Dành cho Admin
- 📈 **Dashboard thống kê** với biểu đồ Recharts (doanh thu theo tháng, tỷ lệ dòng xe)
- 🚗 **Quản lý xe CRUD** - thêm, sửa, xóa thông tin xe
- 📦 **Quản lý đơn cọc** - cập nhật trạng thái: Chờ xử lý → Xác nhận → Bàn giao → Hoàn thành
- 📅 **Quản lý lịch lái thử** - phê duyệt, phân công nhân viên
- 👥 **Quản lý người dùng** với phân quyền theo vai trò

### Bảo mật
- JWT Access Token (15 phút) + Refresh Token (7 ngày)
- Bcrypt mã hóa mật khẩu
- Rate Limiting (200 req/15 phút)
- Helmet Security Headers
- CORS Configuration
- Role-Based Authorization (Admin / Staff / Customer)

---

## 🔌 API Endpoints chính

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /api/auth/register | Đăng ký tài khoản |
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/refresh | Làm mới Access Token |
| GET | /api/cars | Danh sách xe (có filter) |
| GET | /api/cars/:slug | Chi tiết xe |
| POST | /api/orders | Tạo đơn đặt cọc |
| GET | /api/orders/my-orders | Đơn hàng của tôi |
| PUT | /api/orders/:id/status | Cập nhật trạng thái (Admin) |
| POST | /api/test-drives | Đăng ký lái thử |
| GET | /api/dashboard/stats | Thống kê (Admin) |

---

## 📧 Cấu hình Email (Tùy chọn)

Mặc định hệ thống chạy ở chế độ **Mock Email** (in ra console). Để gửi email thật, cập nhật file `server/.env`:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

> Lưu ý: Sử dụng **Gmail App Password** (không phải mật khẩu Gmail thường).

---

## 🚀 Deploy lên Production

### Frontend → Vercel
```bash
cd client
npm run build
# Upload thư mục dist/ lên Vercel
```

### Backend → Render
```bash
# Tạo Web Service trên render.com
# Build Command: npm install && npm run build
# Start Command: npm start
```

### Database → MongoDB Atlas
1. Tạo cluster miễn phí tại mongodb.com/atlas
2. Lấy Connection String và cập nhật biến `MONGO_URI` trong Render

---

## 🎓 Thông tin đồ án

Dự án được phát triển làm đồ án chuyên ngành Công nghệ thông tin với kiến trúc **Fullstack MERN** (MongoDB, Express, React, Node.js) chuẩn Production, áp dụng các pattern: MVC, Clean Code, Separation of Concerns, JWT Auth Flow.
