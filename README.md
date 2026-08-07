# Fresh — Quản lý nhà hàng

Fresh là web quản lý nhà hàng/cửa hàng ăn vặt, giữ nguyên giao diện sáng hiện tại và hỗ trợ vận hành trên 3 máy trong cùng mạng LAN:

| Thiết bị | Chức năng | Địa chỉ mẫu |
| --- | --- | --- |
| Máy chủ quản lý | Chạy máy chủ, quản lý bàn/thực đơn/đơn hàng/kho/nhân viên/báo cáo | `http://localhost:8787/?mode=manager` |
| Máy nhân viên | Chọn bàn, gọi món và tạo đơn | `http://IP-MAY-CHU:8787/?mode=staff` |
| Máy bếp | Nhận món theo bàn và chuyển trạng thái chế biến | `http://IP-MAY-CHU:8787/?mode=kitchen` |

## Chạy thử trên một máy

```bash
npm install
npm start
```

Sau khi build xong, mở `http://localhost:8787/?mode=manager`. Máy chủ tự phục vụ giao diện và API đồng bộ.

Nếu muốn phát triển giao diện riêng:

```bash
# Terminal 1
npm run api

# Terminal 2
npm run dev
```

## Triển khai trên 3 máy

1. Trên máy quản lý, cài Node.js, clone repo và chạy `npm install`.
2. Chạy `npm start`. Máy chủ lắng nghe trên `0.0.0.0:8787` để các máy trong mạng LAN truy cập được.
3. Lấy địa chỉ IPv4 của máy quản lý, ví dụ `192.168.1.20`.
4. Trên máy nhân viên mở `http://192.168.1.20:8787/?mode=staff`.
5. Trên máy bếp mở `http://192.168.1.20:8787/?mode=kitchen`.
6. Nếu máy khác không truy cập được, cho phép cổng TCP `8787` qua tường lửa của máy quản lý và kiểm tra 3 máy cùng mạng LAN.

Chế độ thiết bị cũng có thể đổi bằng danh sách ở thanh trên cùng. Mỗi máy nhớ chế độ đã chọn. Có thể bấm trạng thái kết nối để thử kết nối lại máy chủ.

## Đồng bộ dữ liệu

- Máy chủ lưu dữ liệu dùng chung vào `data/fresh-data.json` trên máy quản lý.
- Máy gọi món gửi đơn mới; máy bếp nhận đơn gần như ngay lập tức qua Server-Sent Events.
- Khi bếp chuyển đơn sang `Đang chế biến` hoặc `Đã xong`, máy quản lý và máy gọi món cũng cập nhật.
- Giỏ món đang chọn chỉ lưu trên máy đang thao tác, tránh nhân viên ghi đè giỏ của nhau.
- Nếu tạm mất máy chủ, giao diện vẫn mở được bằng dữ liệu cục bộ; trạng thái trên thanh trên cùng sẽ chuyển thành `Chỉ máy này`. Khi kết nối lại, ứng dụng sẽ đồng bộ lại dữ liệu chung.

## Chức năng chính

- Dashboard tổng quan với doanh thu, KPI, tình trạng bàn, đơn gần đây và món bán chạy.
- Quản lý bàn, gọi món theo bàn hoặc tạo đơn mang đi.
- Thực đơn 83 món đã nhập, tìm kiếm/lọc danh mục, thêm/sửa/xóa món.
- Màn hình bếp theo 3 cột `Chờ chế biến`, `Đang chế biến`, `Đã xong`.
- Kho nguyên liệu, nhân viên, đơn hàng, báo cáo và xuất CSV.
- Responsive cho desktop và mobile.

## Lưu ý

Bản hiện tại dùng file JSON trên máy chủ nội bộ, phù hợp cho cửa hàng chạy trong một mạng LAN. Chế độ thiết bị là phân luồng giao diện; hệ thống chưa có đăng nhập tài khoản và phân quyền bảo mật theo từng nhân viên.
