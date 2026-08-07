# Fresh — Quản lý nhà hàng

Fresh là web quản lý nhà hàng/cửa hàng ăn vặt với ba màn hình làm việc trên cùng một địa chỉ:

| Thiết bị | Tài khoản mặc định | Màn hình |
| --- | --- | --- |
| Máy quản lý | `admin` / `admin123` | Tổng quan, bàn, thực đơn, kho, nhân viên, đơn hàng, báo cáo |
| Máy nhân viên | `phucvu` / `phucvu123` | Bàn ăn và gọi món |
| Máy bếp | `bep` / `bep12345` | Màn hình bếp |

## Đưa lên Cloudflare

Bản Cloudflare dùng Worker để phục vụ giao diện React và API, D1 để lưu dữ liệu chung, cookie HttpOnly cho phiên đăng nhập, và đồng bộ dữ liệu giữa các máy qua API. Vì vậy cả ba máy chỉ cần mở cùng một URL Cloudflare; không cần chạy máy chủ Node tại cửa hàng.

### Chuẩn bị

- Có tài khoản Cloudflare.
- Cài Node.js 16.17 trở lên.
- Đã clone repository và chạy `npm install`.

### Deploy lần đầu

```bash
npm install
npx wrangler@latest login
npx wrangler@latest d1 create fresh-db
```

Khi Wrangler hỏi có tự thêm binding vào file cấu hình hay không, chọn `No` để tránh tạo trùng binding. Lấy `database_id` từ kết quả lệnh trên và thay:

```json
"database_id": "REPLACE_WITH_D1_DATABASE_ID"
```

trong `wrangler.jsonc` bằng ID thật. Giữ nguyên `binding` là `DB`.

Tiếp tục chạy:

```bash
npm run cloudflare:d1:remote
npm run cloudflare:deploy
```

Sau khi deploy, Wrangler sẽ in ra URL dạng `https://fresh-restaurant.<ten-tai-khoan>.workers.dev`. Mở đúng URL đó trên máy quản lý, máy nhân viên và máy bếp rồi đăng nhập bằng tài khoản tương ứng.

Cloudflare có thể phục vụ Worker và static assets trong cùng một lần deploy; D1 được gắn vào Worker bằng binding `env.DB`. Xem thêm [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) và [D1 Getting Started](https://developers.cloudflare.com/d1/get-started/).

### Chạy Cloudflare ở máy local

```bash
npm run cloudflare:d1:local
npm run cloudflare:dev
```

Lệnh trên chạy giao diện và API qua Wrangler. Dữ liệu local của D1 nằm trong thư mục `.wrangler`, không commit thư mục này lên GitHub.

## Tài khoản và phân quyền

Worker tự tạo ba tài khoản mặc định ở lần khởi động D1 đầu tiên. Quản lý có thể vào `Nhân viên → Tạo tài khoản` để tạo tài khoản riêng cho từng người.

- `manager`: toàn quyền với dữ liệu.
- `staff`: bàn, gọi món và các đơn hàng.
- `kitchen`: màn hình bếp, trạng thái món và bàn liên quan.

Nên tạo tài khoản riêng và thay đổi việc sử dụng tài khoản mặc định trước khi chia sẻ URL công khai.

## Đồng bộ giữa ba máy

- Nhân viên tạo đơn theo bàn.
- Máy bếp nhìn thấy đơn và cập nhật `Chờ chế biến`, `Đang chế biến`, `Đã xong`.
- Máy quản lý và máy nhân viên nhận trạng thái mới tối đa khoảng 2,5 giây sau khi dữ liệu được ghi.
- Dữ liệu dùng chung nằm trong D1; giỏ món đang chọn chỉ nằm ở máy đang thao tác.

## Chạy phiên bản Node/LAN cũ

Nếu chỉ dùng trong một mạng LAN, vẫn có thể chạy phiên bản Node hiện tại:

```bash
# Terminal 1
FRESH_ACCESS_TOKEN="ma-bi-mat" npm run api

# Terminal 2
FRESH_ACCESS_TOKEN="ma-bi-mat" npm run dev
```

Hoặc build và chạy một cổng duy nhất:

```bash
FRESH_ACCESS_TOKEN="ma-bi-mat" npm start
```

Phiên bản này lưu dữ liệu trong `data/fresh-data.json` và cần các máy trong cùng mạng LAN. Mã `FRESH_ACCESS_TOKEN` không được commit lên GitHub.

## Chức năng chính

- Dashboard tổng quan với doanh thu, KPI, tình trạng bàn, đơn gần đây và món bán chạy.
- Quản lý bàn, gọi món theo bàn hoặc tạo đơn mang đi.
- Thực đơn 83 món đã nhập, tìm kiếm/lọc danh mục, thêm/sửa/xóa món.
- Màn hình bếp theo ba cột trạng thái.
- Kho nguyên liệu, nhân viên, đơn hàng, báo cáo và xuất CSV.
- Responsive cho desktop và mobile.
