import { Response, NextFunction } from 'express';
import TestDrive from '../models/TestDrive';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';
import sendEmail from '../utils/sendEmail';

// @desc    Register for test drive
// @route   POST /api/test-drives
// @access  Public/Private
export const createTestDrive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerInfo, carId, date, timeSlot, showroom } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dòng xe đăng ký lái thử' });
    }

    const driveData: any = {
      customerInfo,
      car: carId,
      date,
      timeSlot,
      showroom,
    };

    if (req.user) {
      driveData.user = req.user.id;
    }

    const testDrive = await TestDrive.create(driveData);
    const populatedDrive = await testDrive.populate('car');

    const formattedDate = new Date(date).toLocaleDateString('vi-VN');
    
    // Send email notification
    const emailSubject = `[VinFast] Đăng ký lái thử thành công lịch hẹn ngày ${formattedDate}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #103F91; border-bottom: 2px solid #103F91; padding-bottom: 10px;">LỊCH HẸN LÁI THỬ XE VINFAST</h2>
        <p>Kính chào quý khách <strong>${customerInfo.name}</strong>,</p>
        <p>VinFast đã nhận được yêu cầu đăng ký lái thử xe của quý khách. Dưới đây là thông tin chi tiết lịch hẹn:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mẫu xe đăng ký</th>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${car.name}</strong></td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Ngày lái thử</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${formattedDate}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Khung giờ</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${timeSlot}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Showroom lái thử</th>
            <td style="padding: 10px; border: 1px solid #ddd;">${showroom}</td>
          </tr>
        </table>
        
        <p>Nhân viên tư vấn VinFast sẽ gọi điện thoại xác nhận lịch trình lái thử với quý khách qua số điện thoại <strong>${customerInfo.phone}</strong> trước khi diễn ra lịch hẹn.</p>
        <p style="font-style: italic; color: #ff3b30;">* Lưu ý: Khi đi lái thử, quý khách vui lòng mang theo giấy phép lái xe ô tô (B1/B2) còn hạn sử dụng để làm thủ tục theo đúng quy định pháp luật.</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
          Đây là email gửi tự động từ VinFast Auto. Quý khách vui lòng không trả lời thư này.
        </p>
      </div>
    `;

    await sendEmail({
      email: customerInfo.email,
      subject: emailSubject,
      message: `Đăng ký lái thử xe VinFast ${car.name} thành công ngày ${formattedDate} lúc ${timeSlot}. Địa điểm: ${showroom}.`,
      html: emailHtml,
    });

    // Realtime notification via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('newTestDrive', {
        id: testDrive._id,
        carName: car.name,
        customerName: customerInfo.name,
        date: formattedDate,
        timeSlot,
        showroom,
      });
    }

    res.status(201).json({
      success: true,
      testDrive: populatedDrive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's test drives
// @route   GET /api/test-drives/my-drives
// @access  Private
export const getMyTestDrives = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const drives = await TestDrive.find({ user: req.user.id }).populate('car');

    res.json({
      success: true,
      count: drives.length,
      drives,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all test drives
// @route   GET /api/test-drives
// @access  Private/Admin or Staff
export const getTestDrives = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const drives = await TestDrive.find()
      .populate('car')
      .populate('assignedStaff', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: drives.length,
      drives,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update test drive status or assign staff
// @route   PUT /api/test-drives/:id/status
// @access  Private/Admin or Staff
export const updateTestDriveStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, assignedStaffId } = req.body;

    const drive = await TestDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch đăng ký lái thử' });
    }

    if (status) {
      drive.status = status;
    }

    if (assignedStaffId) {
      drive.assignedStaff = assignedStaffId;
    }

    await drive.save();
    const updatedDrive = await TestDrive.findById(req.params.id)
      .populate('car')
      .populate('assignedStaff', 'name email phone');

    res.json({
      success: true,
      testDrive: updatedDrive,
    });
  } catch (error) {
    next(error);
  }
};
