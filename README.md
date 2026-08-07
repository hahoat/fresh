# Fresh — Quản lý nhà hàng

Fresh là web quản lý nhà hàng/cửa hàng ăn vặt, giữ nguyên giao diện sáng hiện tại và hỗ trợ vận hành trên 3 máy trong cùng mạng LAN. Cả 3 máy dùng chung một địa chỉ web, sau đó đăng nhập bằng tài khoản theo vị trí làm việc:

| Thiết bị | Chức năng | Địa chỉ mẫu |
| --- | --- | --- |
| Máy chủ quản lý | Chạy máy chủ, quản lý bàn/thực đơn/đơn hàng/kho/nhân viên/báo cáo | `http://localhost:8787/` |
| Máy nhân viên | Chọn bàn, gọi món và tạo đơn | `http://IP-MAY-CHU:8787/` |
| Máy bếp | Nhận món theo bàn và chuyển trạng thái chế biến | `http://IP-MAY-CHU:8787/` |

## Chạy thử trên một máy

```bash
npm install

# Linux/macOS
FRESH_ACCESS_TOKEN="dat-ma-truy-cap-rieng" npm start
```

`FRESH_ACCESS_TOKEN` là bắt buộc để API nhận dữ liệu. Không commit mã này vào GitHub. Trên PowerShell có thể dùng:

```powershell
$env:FRESH_ACCESS_TOKEN = "dat-ma-truy-cap-rieng"
npm start
```

Sau khi build xong, mở `http://localhost:8787/`. Máy chủ tự phục vụ giao diện và API đồng bộ.

## Tài khoản và phân quyền

Tài khoản mặc định được tạo tự động lần đầu máy chủ chạy:

| Tài khoản | Mật khẩu | Vai trò | Màn hình mở mặc định |
| --- | --- | --- | --- |
| `admin` | `admin123` | Quản lý | Tổng quan |
| `phucvu` | `phucvu123` | Nhân viên gọi món | Bàn ăn |
| `bep` | `bep12345` | Bếp | Màn hình bếp |

- Quản lý được xem và cập nhật toàn bộ dữ liệu, đồng thời vào `Nhân viên → Tạo tài khoản` để tạo thêm tài khoản.
- Nhân viên gọi món chỉ thấy `Bàn ăn`, có thể chọn bàn, gọi món và tạo đơn.
- Tài khoản bếp chỉ thấy `Màn hình bếp`, nhận món theo bàn và chuyển món qua `Đang chế biến` hoặc `Đã xong`.
- Mật khẩu được băm bằng `scrypt` và lưu trong `data/fresh-users.json`, không lưu dạng văn bản. Phiên đăng nhập có hiệu lực 12 giờ hoặc đến khi máy chủ khởi động lại.

Nên đổi các mật khẩu mặc định bằng cách tạo tài khoản riêng cho từng người sử dụng và không chia sẻ mã truy cập LAN công khai.

Nếu muốn phát triển giao diện riêng:

```bash
# Terminal 1
FRESH_ACCESS_TOKEN="dat-ma-truy-cap-rieng" npm run api

# Terminal 2
FRESH_ACCESS_TOKEN="dat-ma-truy-cap-rieng" npm run dev
```

Nếu đang mở giao diện ở `http://localhost:5173` mà bấm đăng nhập thấy báo không kết nối được máy chủ, hãy kiểm tra Terminal 1 đã chạy `npm run api` và hai lệnh dùng cùng một `FRESH_ACCESS_TOKEN`. Vite đã được cấu hình tự lấy mã từ `FRESH_ACCESS_TOKEN`; không cần khai báo thêm `VITE_FRESH_ACCESS_TOKEN`.

## Triển khai trên 3 máy

1. Trên máy quản lý, cài Node.js, clone repo và chạy `npm install`.
2. Chạy `npm start`. Máy chủ lắng nghe trên `0.0.0.0:8787` để các máy trong mạng LAN truy cập được.
3. Lấy địa chỉ IPv4 của máy quản lý, ví dụ `192.168.1.20`.
4. Trên máy nhân viên mở `http://192.168.1.20:8787/` rồi đăng nhập bằng tài khoản vai trò `Nhân viên gọi món`.
5. Trên máy bếp mở `http://192.168.1.20:8787/` rồi đăng nhập bằng tài khoản vai trò `Bếp`.
6. Nếu máy khác không truy cập được, cho phép cổng TCP `8787` qua tường lửa của máy quản lý và kiểm tra 3 máy cùng mạng LAN.

Vai trò được lấy từ tài khoản đăng nhập, không có nút đổi vai trò ở thanh trên cùng. Có thể bấm trạng thái kết nối để thử kết nối lại máy chủ. Khi không build token vào frontend, có thể truyền mã truy cập ở URL một lần: `?token=dat-ma-truy-cap-rieng`.

## Đồng bộ dữ liệu

- Máy chủ lưu dữ liệu dùng chung vào `data/fresh-data.json` trên máy quản lý.
- Máy gọi món gửi đơn mới; máy bếp nhận đơn gần như ngay lập tức qua Server-Sent Events.
- Khi bếp chuyển đơn sang `Đang chế biến` hoặc `Đã xong`, máy quản lý và máy gọi món cũng cập nhật.
- Giỏ món đang chọn chỉ lưu trên máy đang thao tác, tránh nhân viên ghi đè giỏ của nhau.
- Nếu tạm mất máy chủ, giao diện vẫn mở được bằng dữ liệu cục bộ; trạng thái trên thanh trên cùng sẽ chuyển thành `Chỉ máy này`. Khi kết nối lại, ứng dụng sẽ đồng bộ lại dữ liệu chung. Các thao tác cần xác thực sẽ hoạt động đầy đủ sau khi máy chủ online và đăng nhập lại nếu phiên đã hết hạn.

## Chức năng chính

- Dashboard tổng quan với doanh thu, KPI, tình trạng bàn, đơn gần đây và món bán chạy.
- Quản lý bàn, gọi món theo bàn hoặc tạo đơn mang đi.
- Thực đơn 83 món đã nhập, tìm kiếm/lọc danh mục, thêm/sửa/xóa món.
- Màn hình bếp theo 3 cột `Chờ chế biến`, `Đang chế biến`, `Đã xong`.
- Kho nguyên liệu, nhân viên, đơn hàng, báo cáo và xuất CSV.
- Responsive cho desktop và mobile.

## Lưu ý

Bản hiện tại dùng file JSON trên máy chủ nội bộ, phù hợp cho cửa hàng chạy trong một mạng LAN. API yêu cầu `FRESH_ACCESS_TOKEN`, không mở ghi dữ liệu công khai; ứng dụng còn yêu cầu đăng nhập tài khoản và kiểm tra quyền ở máy chủ. Khi đưa ra Internet, nên đặt HTTPS, đổi mã truy cập và thay toàn bộ mật khẩu mặc định.
