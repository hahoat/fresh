# Fresh — Quản lý bán hàng

Giao diện web quản lý bán hàng cho cửa hàng ăn vặt **Fresh**, xây bằng React + Vite.

## Chạy local

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in ra trong terminal, thường là `http://localhost:5173`.

## Đã có trong bản demo

- Dashboard tổng quan với doanh thu 7 ngày, KPI, đơn gần đây và món bán chạy.
- Tạo đơn nhanh: tìm món, lọc danh mục, tăng/giảm số lượng và chốt đơn.
- Luồng thanh toán: nhập tên khách, chọn tiền mặt/chuyển khoản/ví điện tử và thêm ghi chú.
- Trang Bán hàng dạng POS.
- Trang Sản phẩm: tìm kiếm, lọc danh mục, thêm/sửa/xóa sản phẩm, giá bán và tồn kho.
- Trang Đơn hàng: tìm kiếm, lọc trạng thái, cập nhật hoàn tất, in hóa đơn và xuất CSV.
- Trang Báo cáo với doanh thu theo ngày và theo danh mục.
- Responsive cho desktop và mobile, có thanh điều hướng dưới màn hình trên mobile.
- Dữ liệu sản phẩm, giỏ hàng và đơn hàng được lưu vào `localStorage` phiên bản `fresh-sales-manager:v1`.

## Ghi chú

Dữ liệu hiện đang lưu cục bộ trên trình duyệt để chạy demo không cần backend. Bước tiếp theo có thể nối backend/database để dùng nhiều thiết bị, quản lý tài khoản nhân viên, đồng bộ đơn hàng và báo cáo thật.
