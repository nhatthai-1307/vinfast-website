import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';
import sendEmail from '../utils/sendEmail';

// @desc    Create new order/deposit
// @route   POST /api/orders
// @access  Private/Public (allow booking with or without account, but link if logged in)
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerInfo, carId, selectedColor, purchaseOption, paymentMethod, installmentDetails, showroom, depositAmount } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dòng xe cần đặt cọc' });
    }

    if (car.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Rất tiếc, dòng xe này hiện đã hết hàng trong kho' });
    }

    // Generate Order Number
    const orderNumber = `VF-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData: any = {
      orderNumber,
      customerInfo,
      car: carId,
      selectedColor,
      purchaseOption,
      paymentMethod,
      showroom,
      depositAmount: depositAmount || 10000000,
      paymentStatus: 'paid', // Mark paid for simulation purposes
    };

    if (req.user) {
      orderData.user = req.user.id;
    }

    if (paymentMethod === 'installment') {
      orderData.installmentDetails = installmentDetails;
    }

    const order = await Order.create(orderData);

    // Decrease Car Stock
    car.stock -= 1;
    await car.save();

    // Populate car details for response and email
    const populatedOrder = await order.populate('car');

    // Send confirmation email
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.price);
    const formattedDeposit = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.depositAmount);
    
    const emailSubject = `[VinFast] Xác nhận đặt cọc thành công đơn hàng ${orderNumber}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #103F91; border-bottom: 2px solid #103F91; padding-bottom: 10px;">CẢM ƠN QUÝ KHÁCH ĐÃ ĐẶT XE VINFAST</h2>
        <p>Kính chào quý khách <strong>${customerInfo.name}</strong>,</p>
        <p>VinFast xin chân thành cảm ơn quý khách đã tin tưởng và lựa chọn dòng xe điện của chúng tôi. Yêu cầu đặt cọc trực tuyến của quý khách đã được xử lý thành công.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mã đơn hàng</th>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${orderNumber}</strong></td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mẫu xe đặt cọc</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${car.name} (${selectedColor})</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Giá xe niêm yết</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${formattedPrice}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Số tiền đặt cọc nhận được</th>
            <td style="padding: 10px; border: 1px solid #ddd; color: #22c55e;"><strong>${formattedDeposit}</strong></td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Hình thức mua pin</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${purchaseOption === 'buy-battery' ? 'Mua đứt pin' : 'Thuê pin hàng tháng'}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Hình thức thanh toán</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${paymentMethod === 'full-payment' ? 'Trả thẳng' : 'Trả góp qua ngân hàng'}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Showroom bàn giao xe</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${showroom}</td>
          </tr>
        </table>
        
        <p>Nhân viên tư vấn của VinFast sẽ liên hệ với quý khách qua số điện thoại <strong>${customerInfo.phone}</strong> trong vòng 24 giờ làm việc để hỗ trợ hoàn tất các thủ tục tiếp theo.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
          Đây là email tự động gửi từ Hệ Thống Đặt Xe Trực Tuyến VinFast. Quý khách vui lòng không trả lời email này.
        </p>
      </div>
    `;

    await sendEmail({
      email: customerInfo.email,
      subject: emailSubject,
      message: `Cảm ơn bạn đã đặt cọc xe VinFast ${car.name}. Mã đơn hàng: ${orderNumber}. Showroom nhận: ${showroom}.`,
      html: emailHtml,
    });

    // Realtime notification via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', {
        orderNumber,
        carName: car.name,
        customerName: customerInfo.name,
        depositAmount: order.depositAmount,
        createdAt: order.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('car');

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin or Staff
export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().populate('car').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).populate('car');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Auth check: User can only view their own order unless Admin/Staff
    if (order.user?.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin or Staff
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('car');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    // Trigger realtime notification to user if connected
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', {
        userId: order.user?.toString(),
        orderNumber: order.orderNumber,
        status: orderStatus,
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
