# Fresh — Quản lý nhà hàng

Giao diện web quản lý nhà hàng **Fresh**, xây bằng React + Vite. Bản demo phù hợp cho cửa hàng ăn vặt/quán nhỏ và có thể mở rộng thêm backend sau này.

## Chạy local

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in ra trong terminal, thường là `http://localhost:5173`.

## Đã có trong bản demo

- Dashboard tổng quan với doanh thu 7 ngày, KPI, tình trạng bàn, đơn gần đây và món bán chạy.
- Quản lý bàn: sơ đồ 12 bàn, khu vực, số chỗ, trạng thái trống/đang phục vụ/chờ thanh toán/đặt trước.
- Gọi món theo bàn hoặc tạo đơn mang đi.
- Tạo đơn nhanh: tìm món, lọc danh mục, tăng/giảm số lượng và chốt đơn.
- Luồng thanh toán: nhập tên khách, chọn tiền mặt/chuyển khoản/ví điện tử và thêm ghi chú.
- Trang Bán hàng dạng POS.
- Thực đơn: tìm kiếm, lọc danh mục, thêm/sửa/xóa món, giá bán và tồn kho theo món.
- Màn hình bếp: theo dõi đơn chờ chế biến, đang chế biến và đã xong.
- Kho nguyên liệu: theo dõi mức tồn, cảnh báo sắp hết và thao tác nhập thêm.
- Trang Đơn hàng: tìm kiếm, lọc trạng thái, cập nhật hoàn tất, in hóa đơn và xuất CSV.
- Trang Báo cáo với doanh thu theo ngày và theo danh mục.
- Responsive cho desktop và mobile, có thanh điều hướng dưới màn hình trên mobile.
- Dữ liệu thực đơn, bàn, kho, giỏ hàng và đơn hàng được lưu vào `localStorage` để chạy demo không cần backend.

## Ghi chú

Dữ liệu hiện đang lưu cục bộ trên trình duyệt để chạy demo không cần backend. Bước tiếp theo có thể nối backend/database để dùng nhiều thiết bị, quản lý tài khoản nhân viên, phân quyền, định lượng nguyên liệu, đồng bộ đơn hàng và báo cáo thật.
