# Chuẩn bị dự án chạy local

## Phạm vi

Hoàn thành MVP trong README, chạy được tại http://localhost:3000. Chưa deploy; không cần chuẩn bị Vercel, GitHub, tên miền hay QR. Local vẫn cần Internet để tải bản đồ, Sheet và ảnh.

## 1. Mapbox

- Tạo tài khoản tại https://account.mapbox.com/ và hoàn tất xác minh theo yêu cầu dịch vụ.
- Vào Access tokens, tạo public token riêng tên `maivang-local`, giữ quyền public mặc định phục vụ xem bản đồ; không chọn secret scopes.
- Nếu đặt URL restrictions, cho phép `http://localhost:3000`; thêm `http://127.0.0.1:3000` nếu sử dụng địa chỉ này.
- Điền token bắt đầu bằng `pk.` vào `NEXT_PUBLIC_MAPBOX_TOKEN` trong `.env.local`.
- Style riêng là tùy chọn. Nếu đã có, cung cấp URL `mapbox://styles/<username>/<style-id>`; nếu chưa có, mình dùng style có sẵn trước. Bạn không cần tự thiết kế bản đồ.

Tài liệu: https://docs.mapbox.com/accounts/guides/tokens/

## 2. Cloudinary

MVP chỉ hiển thị ảnh bằng URL, không upload từ ứng dụng. Vì vậy không cần Cloudinary token, API key, API secret hoặc upload preset.

- Tạo tài khoản tại https://cloudinary.com/.
- Lấy **Cloud name** của product environment trong Console, điền vào `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
- Vào Media Library, upload ảnh địa điểm; một ảnh mỗi địa điểm là đủ để bắt đầu.
- Copy URL ảnh HTTPS, điền vào cột `image_url` trong Sheet. Dùng link ảnh trực tiếp, không dùng link trang quản lý asset.

URL có dạng: `https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/<public_id>.jpg` (đây chỉ là mẫu cấu trúc).

Tài liệu: https://cloudinary.com/documentation/dam_upload_store_assets và https://cloudinary.com/documentation/image_transformations

## 3. Google Sheets

Tạo Sheet mới, đặt tên tab là `places`. Hàng đầu là các tên cột sau, mỗi hàng tiếp theo là một địa điểm. Không gộp ô.

| Cột | Bắt buộc | Điền gì |
| --- | --- | --- |
| `id` | Có | Mã duy nhất, ổn định, ví dụ `food-001` |
| `name` | Có | Tên địa điểm |
| `category` | Có | Một trong `Food`, `Sightseeing`, `Cafe`, `Tour`, `Essentials` |
| `lat` | Có | Vĩ độ, số thập phân dùng dấu chấm |
| `lng` | Có | Kinh độ, số thập phân dùng dấu chấm |
| `description` | Nên có | Mô tả; viết tiếng Việt trước cũng được, mình dịch sau |
| `what_to_order` | Không | Món nên gọi, ví dụ `Coconut coffee — Cà phê dừa` |
| `price_range` | Không | Khoảng giá thật nếu biết; ghi rõ VND |
| `opening_hours` | Không | Giờ mở cửa đã xác minh |
| `tips` | Không | Mẹo thực tế như chỉ nhận tiền mặt |
| `image_url` | Nên có | Link ảnh HTTPS từ Cloudinary |
| `illus_x` | Không | Để trống, dùng ở giai đoạn sau |
| `illus_y` | Không | Để trống, dùng ở giai đoạn sau |

Nhập 3–5 địa điểm để chạy thử; chưa cần đủ 15–20. Không biết giá/giờ thì để trống.

Lấy tọa độ bằng cách bấm chuột phải đúng vị trí trên Google Maps ở máy tính: số đầu là `lat`, số sau là `lng`. Nếu chưa lấy được, gửi riêng tên và link ghim Maps để mình hỗ trợ.

Xuất bản dữ liệu:

1. Chọn **File → Share → Publish to web** (Tệp → Chia sẻ → Xuất bản lên web).
2. Chọn riêng tab `places` và định dạng **Comma-separated values (.csv)**.
3. Bấm **Publish**, copy link; giữ tùy chọn tự xuất bản lại khi thay đổi nếu có.
4. Điền link vào `GOOGLE_SHEET_CSV_URL`. Không dùng link `/edit` của trình chỉnh sửa.

Link thường có dạng `https://docs.google.com/spreadsheets/d/e/<publication-id>/pub?gid=<tab-id>&single=true&output=csv`.

Không cần Google API key, service account hay chia sẻ quyền chỉnh sửa. Tab đã publish là công khai, chỉ điền nội dung dành cho khách.

Tài liệu: https://support.google.com/docs/answer/183965

## 4. Thông tin homestay gửi riêng

- Tên hiển thị chính thức.
- Địa chỉ và link ghim Google Maps hoặc tọa độ.
- Số WhatsApp có mã quốc gia hoặc link Zalo đang dùng.
- Logo nếu có: để trong repo và cho mình đường dẫn; không có vẫn làm được.

Homestay có cấu hình riêng, không cần thêm loại `Homestay` vào Sheet.

## 5. Cấu hình bạn điền

Copy `.env.example` thành `.env.local` ở thư mục gốc và điền:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_MAPBOX_STYLE_URL=
GOOGLE_SHEET_CSV_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

Style URL có thể để trống. Không cần gửi mật khẩu, OTP hay secret key. `.env.local` đã được bỏ qua trong Git. Điền xong báo mình, không cần dán token lại vào chat.

## 6. Phần mình làm sau khi bạn chuẩn bị xong

1. Khởi tạo Next.js App Router + TypeScript và cấu hình chạy local.
2. Xây giao diện tiếng Anh ưu tiên điện thoại: lọc 5 nhóm, danh sách và thẻ chi tiết.
3. Tích hợp Mapbox, marker homestay, vị trí khách theo yêu cầu và đồng bộ bản đồ/danh sách.
4. Đọc CSV phía server, kiểm tra dữ liệu, cache, xử lý lỗi và tối ưu ảnh Cloudinary.
5. Làm Directions, liên hệ, món nên gọi Anh–Việt và thẻ câu nói.
6. Hiển thị khoảng cách đường chim bay có nhãn ước tính; không suy ra thời gian di chuyển.
7. Kiểm tra build, typecheck, parser dữ liệu, các luồng chính và trường hợp từ chối vị trí/nguồn dữ liệu lỗi.
8. Bàn giao mã nguồn và hướng dẫn `npm install`, `npm run dev`, `npm run build`, `npm start`.

Tiêu chí hoàn tất: chạy được tại localhost, kết nối bản đồ/Sheet/ảnh đã cung cấp và dùng được các chức năng MVP. Không bao gồm deploy. Bản đồ vẽ tay, PWA, đa ngôn ngữ và tính năng mở rộng để giai đoạn sau.
