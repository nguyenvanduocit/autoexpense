# Ứng dụng Quản lý Chi phí Xe Ô tô
## Mô tả
Ứng dụng web giúp người dùng theo dõi và quản lý các khoản chi phí liên quan đến việc sở hữu và vận hành xe ô tô.

## Công nghệ sử dụng
- Frontend: Vue 3
- UI Framework: Vuetify 3
- State Management: Pinia
- Router: Vue Router
- Backend: Node.js + Express
- Database: MongoDB

## Chức năng chính
1. Quản lý chi phí
   - Thêm, sửa, xóa các khoản chi phí
   - Phân loại chi phí (xăng, phí cầu đường, bảo dưỡng, rửa xe, v.v.)
   - Ghi chú cho mỗi khoản chi
   - Ngày tháng chi tiêu

2. Thống kê và báo cáo
   - Tổng chi phí theo tháng/năm
   - Biểu đồ phân tích chi phí theo loại
   - Xu hướng chi tiêu theo thời gian
   - Xuất báo cáo

3. Nhắc nhở
   - Lịch bảo dưỡng định kỳ
   - Đăng kiểm xe
   - Gia hạn bảo hiểm

4. Quản lý thông tin xe
   - Thông tin cơ bản của xe (biển số, hãng, model)
   - Lịch sử bảo dưỡng
   - Số km đã đi

## Giao diện người dùng
- Thiết kế tối giản, dễ sử dụng
- Responsive design (desktop & mobile)
- Dark/Light mode
- Dashboard tổng quan
- Form nhập liệu đơn giản
- Biểu đồ trực quan

## Yêu cầu phi chức năng
1. Bảo mật
   - Xác thực người dùng
   - Mã hóa dữ liệu nhạy cảm
   - Phân quyền truy cập

2. Hiệu năng
   - Thời gian tải trang < 2s
   - Tối ưu hóa database queries
   - Caching phù hợp

3. Khả năng mở rộng
   - Kiến trúc module
   - API documentation
   - Code có thể tái sử dụng

## Dependencies
```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vuetify": "^3.3.0",
    "pinia": "^2.1.0",
    "vue-router": "^4.2.0",
    "chart.js": "^4.3.0",
    "axios": "^1.4.0"
  }
} 