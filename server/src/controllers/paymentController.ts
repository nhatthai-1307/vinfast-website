import { Request, Response, NextFunction } from 'express';
import { VNPay, ignoreLogger } from 'vnpay';
import Order from '../models/Order';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';
import sendEmail from '../utils/sendEmail';

// Initialize VNPay instance
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE || 'CGXZLS0Z',
  secureSecret: process.env.VNP_HASH_SECRET || 'XNBCJFAEZJHL2KHVUZZXBHRAVELKMF0W',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
  hashAlgorithm: 'SHA512',
  enableLog: false,
  loggerFn: ignoreLogger,
});

// @desc    Create VNPay Payment URL
// @route   POST /api/payment/create_payment_url
// @access  Public (Guest or logged in user)
export const createPaymentUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      customerInfo,
      carId,
      selectedColor,
      purchaseOption,
      paymentMethod,
      installmentDetails,
      showroom,
      depositAmount,
      bankCode,
    } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dòng xe cần đặt cọc' });
    }

    if (car.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Rất tiếc, dòng xe này hiện đã hết hàng trong kho' });
    }

    const orderNumber = `VF-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalDeposit = Number(depositAmount) || 10000000;

    const defaultColor = (car.colors && car.colors.length > 0) ? car.colors[0].name : 'Trắng / Mặc định';
    const colorToSave = selectedColor || defaultColor;

    // Create Order with pending status
    const orderData: any = {
      orderNumber,
      customerInfo,
      car: carId,
      selectedColor: colorToSave,
      purchaseOption: purchaseOption || 'rent-battery',
      paymentMethod: paymentMethod || 'full-payment',
      showroom: showroom || 'VinFast Showroom Landmark 81, TP.HCM',
      depositAmount: finalDeposit,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    };

    if (req.user) {
      orderData.user = req.user.id;
    }

    if (paymentMethod === 'installment') {
      orderData.installmentDetails = installmentDetails;
    }

    const order = await Order.create(orderData);

    const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payment/vnpay_return';
    const ipAddr =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const cleanIp = ipAddr.includes('::') ? '127.0.0.1' : ipAddr;

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: finalDeposit,
      vnp_IpAddr: cleanIp,
      vnp_TxnRef: orderNumber,
      vnp_OrderInfo: `Thanh toan dat coc xe ${car.name} - Ma don ${orderNumber}`,
      vnp_OrderType: 'other' as any,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: 'vn',
      ...(bankCode ? { vnp_BankCode: bankCode } : {}),
    });

    res.json({
      success: true,
      paymentUrl,
      orderNumber,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    VNPay Return URL callback handler
// @route   GET /api/payment/vnpay_return
// @access  Public
export const vnpayReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as Record<string, any>;
    const verifyResult = vnpay.verifyReturnUrl(query);

    const orderNumber = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionNo = query.vnp_TransactionNo || '';
    const bankCode = query.vnp_BankCode || '';
    const payDate = query.vnp_PayDate || '';
    const amount = Number(query.vnp_Amount) / 100;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Verify hash checksum
    if (!verifyResult.isVerified) {
      console.error('VNPay Checksum verification failed!');
      return res.redirect(`${frontendUrl}/payment-result?status=checksum_failed&orderNumber=${orderNumber}`);
    }

    const order = await Order.findOne({ orderNumber }).populate('car');
    if (!order) {
      return res.redirect(`${frontendUrl}/payment-result?status=not_found&orderNumber=${orderNumber}`);
    }

    // Response code '00' = Success
    if (responseCode === '00' && verifyResult.isSuccess) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.vnpayTransactionId = transactionNo;
      order.vnpayBankCode = bankCode;
      order.vnpayPayDate = payDate;
      await order.save();

      // Decrease Car stock
      if (order.car) {
        const car = await Car.findById(order.car);
        if (car && car.stock > 0) {
          car.stock -= 1;
          await car.save();
        }
      }

      // Send confirmation email
      try {
        const carName = (order.car as any)?.name || 'VinFast Electric Car';
        const carPrice = (order.car as any)?.price || 0;
        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(carPrice);
        const formattedDeposit = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.depositAmount);

        const customerName = order.customerInfo?.name || 'Quý khách';
        const customerEmail = order.customerInfo?.email;

        const emailSubject = `[VinFast] Xác nhận thanh toán đặt cọc thành công qua VNPAY - Đơn hàng ${orderNumber}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #103F91; border-bottom: 2px solid #103F91; padding-bottom: 10px;">THANH TOÁN ĐẶT CỌC THÀNH CÔNG QUA VNPAY</h2>
            <p>Kính chào quý khách <strong>${customerName}</strong>,</p>
            <p>VinFast xin trân trọng thông báo giao dịch đặt cọc trực tuyến của quý khách qua cổng <strong>VNPAY</strong> đã được xử lý thành công.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mã đơn hàng</th>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${orderNumber}</strong></td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mã giao dịch VNPAY</th>
                <td style="padding: 10px; border: 1px solid #ddd; color: #2563eb;"><strong>${transactionNo}</strong></td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Ngân hàng thanh toán</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${bankCode}</td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mẫu xe đặt cọc</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${carName} (${order.selectedColor})</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Số tiền đặt cọc đã thanh toán</th>
                <td style="padding: 10px; border: 1px solid #ddd; color: #22c55e;"><strong>${formattedDeposit}</strong></td>
              </tr>
              <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Trạng thái đơn hàng</th>
                <td style="padding: 10px; border: 1px solid #ddd; color: #2563eb;"><strong>Đã xác nhận cọc</strong></td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Showroom nhận xe</th>
                <td style="padding: 10px; border: 1px solid #ddd;">${order.showroom}</td>
              </tr>
            </table>
            
            <p>Nhân viên tư vấn của VinFast sẽ liên hệ với quý khách trong vòng 24 giờ để hỗ trợ làm hợp đồng và bàn giao xe.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
              Cảm ơn quý khách đã tin tưởng và đồng hành cùng VinFast Electric Auto!
            </p>
          </div>
        `;

        if (customerEmail) {
          await sendEmail({
            email: customerEmail,
            subject: emailSubject,
            message: `Thanh toán VNPAY thành công cho đơn cọc xe VinFast ${carName}. Mã đơn: ${orderNumber}. Mã GD VNPAY: ${transactionNo}.`,
            html: emailHtml,
          });
        }
      } catch (mailErr) {
        console.error('Error sending confirmation email:', mailErr);
      }

      // Realtime notification via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('newOrder', {
          orderNumber,
          carName: (order.car as any)?.name || 'VinFast',
          customerName: order.customerInfo?.name || 'Khách hàng',
          depositAmount: order.depositAmount,
          paymentStatus: 'paid',
          createdAt: new Date(),
        });
      }

      return res.redirect(
        `${frontendUrl}/payment-result?status=success&orderNumber=${orderNumber}&amount=${amount}&transactionNo=${transactionNo}&bankCode=${bankCode}`
      );
    } else {
      // Payment Failed or Cancelled by User
      order.paymentStatus = 'failed';
      await order.save();

      return res.redirect(
        `${frontendUrl}/payment-result?status=failed&orderNumber=${orderNumber}&responseCode=${responseCode}`
      );
    }
  } catch (error) {
    next(error);
  }
};
