# 🥥 Bến Tre Local Guide

> Web app hướng dẫn du lịch dành cho khách nước ngoài ở homestay tại Bến Tre.

## 📖 1. Mô tả dự án

Web app (ưu tiên giao diện điện thoại) dành cho **khách nước ngoài ở homestay**, gợi ý các địa điểm tham quan, quán ăn, quán cà phê... do chủ homestay **tự chọn lọc**. Khách xem trên bản đồ mang phong cách riêng của homestay. Khi muốn đi, khách bấm nút để **mở Google Maps chỉ đường**.

- **Người dùng:** khách Tây tự túc, không đi theo tour
- **Cách truy cập:** quét mã QR đặt trong phòng hoặc ở sảnh, không cần đăng nhập
- **Ngôn ngữ:** tiếng Anh (mở rộng sau: Pháp, Đức...)
- **Giá trị cốt lõi:** thông tin do người địa phương chọn lọc, thân thiện, có kèm mẹo thực tế

## ✨ 2. Chức năng bản đầu tiên (MVP)

| Nhóm | Chức năng |
|---|---|
| **Bản đồ** | Chỉ hiển thị địa điểm do homestay thêm vào; marker homestay nổi bật; vị trí hiện tại của khách |
| **Lọc và danh sách** | Lọc theo loại (Food, Sightseeing, Cafe, Tour, Essentials); danh sách sắp xếp theo khoảng cách |
| **Thẻ địa điểm** | Ảnh, mô tả tiếng Anh, giá, giờ mở cửa, khoảng cách hoặc thời gian đi từ homestay, mẹo (chỉ nhận tiền mặt, nên trả giá...) |
| **What to order** | Tên món tiếng Anh kèm tiếng Việt để đưa người bán xem |
| **Chỉ đường** | Nút "Directions" mở Google Maps (deep link) |
| **Thông tin thiết yếu** | ATM, nhà thuốc, bệnh viện, bến xe, cây xăng |
| **Thẻ câu nói** | Một số câu tiếng Việt hay dùng: "Không cay", "Bao nhiêu tiền?", "Tính tiền"... |
| **Liên hệ** | Nút WhatsApp hoặc Zalo gọi homestay |


## 🚀 3. Chức năng dự định mở rộng

1. **Bản đồ vẽ tay**, có nút chuyển Illustrated / Real map
2. **Lộ trình gợi ý**, ví dụ "Half-day bike loop" vẽ thành đường trên bản đồ
3. **PWA dùng khi mạng yếu**: lưu cache, cho phép thêm vào màn hình chính
4. **Đa ngôn ngữ**: Pháp, Đức...
5. **Đánh giá nhẹ**: nút 👍 "I went here"
6. **Đặt dịch vụ của homestay**: thuê xe đạp, tour sông nước, nấu ăn (nguồn thu thêm)
7. **Cho khách đóng góp địa điểm có kiểm duyệt**: chỉ làm khi lượng người dùng đủ lớn
8. **Góp ý**: Nút "Suggest a place" dẫn tới Google Form, chủ homestay đọc rồi tự thêm

## 🎨 4. Nhận diện và giao diện

- **Bản đồ nền:** tự chọn màu bằng Mapbox Studio: sông xanh nhạt, vườn xanh lá dừa, đường màu be hoặc nâu; ẩn icon và chữ thừa
- **Marker:** icon vẽ tay theo từng loại (🥥 🍜 🛶 ☕), riêng homestay dùng logo
- **Màu chủ đạo:** xanh dừa, nâu gỗ, vàng nắng
- **Giọng văn:** thân thiện như chủ nhà giới thiệu (*"Our family's favorite!..."*)

## 🛠️ 5. Công nghệ

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js** (App Router) | Vừa làm frontend, vừa chạy code phía server (thay cho backend riêng) |
| Bản đồ | **Mapbox GL JS** + style tạo bằng Mapbox Studio | Chỉ hiển thị marker của homestay |
| Dữ liệu | **Google Sheets** | Đóng vai trò database; server đọc rồi cache lại |
| Ảnh | **Cloudinary** | Lưu ảnh; tự nén, tự resize, tự chuyển định dạng qua URL |
| Chỉ đường | Google Maps URL | `https://www.google.com/maps/dir/?api=1&destination=lat,lng` |
| Vị trí khách | Geolocation API | Có sẵn trong trình duyệt |
| Hosting | **Vercel** | Miễn phí, deploy tự động khi push code lên GitHub |
| Mở rộng | Supabase, PWA | Supabase (PostgreSQL) khi cần lưu dữ liệu khách gửi lên; PWA để dùng khi mạng yếu |

### Vì sao chưa cần backend và database riêng?
- Không có đăng nhập, khách **chỉ đọc** dữ liệu.
- Google Sheets đảm nhiệm phần dữ liệu, Cloudinary lo ảnh, Google Maps lo chỉ đường, Google Form lo góp ý.
- Phần xử lý phía server (đọc Sheets, cache, giấu key) do **Next.js chạy serverless trên Vercel**.
- Chỉ thêm **Supabase** khi làm các tính năng khách ghi dữ liệu lên: 👍, đặt dịch vụ, đóng góp địa điểm.

> 💰 **Chi phí dự kiến:** gần như 0đ. Mapbox, Cloudinary và Vercel đều có bản miễn phí, đủ dùng cho quy mô một homestay. Chỉ tốn tiền tên miền (khoảng 250–300k/năm) và tiền thuê vẽ bản đồ nếu làm phần mở rộng.

## 🏗️ 6. Kiến trúc

```
┌──────────────┐   ┌──────────────┐
│ Google Sheets│   │  Cloudinary  │ ← chủ homestay nhập dữ liệu, upload ảnh
└──────┬───────┘   └──────┬───────┘
       │ đọc + cache       │ link ảnh
┌──────▼───────────────────▼──────┐
│     Next.js (host trên Vercel)  │
│  - Server: đọc Sheets, cache    │
│  - Client: Mapbox GL JS, giao diện│
└──────┬──────────────────────────┘
       │
   📱 Khách (quét QR) ──bấm Directions──> Google Maps app

Giai đoạn sau: thêm Supabase (👍, đặt dịch vụ, khách đóng góp)
```

**Quy trình cập nhật nội dung:**
1. Upload ảnh lên Cloudinary rồi copy link
2. Thêm một dòng mới vào Google Sheets, dán link ảnh vào cột `image_url`
3. Web đọc dữ liệu Sheet mới khi tải lại trang, không cần sửa code

## 🗂️ 7. Cấu trúc dữ liệu (các cột trong Google Sheets)

| Cột | Mô tả |
|---|---|
| `id` | Mã định danh |
| `name` | Tên địa điểm |
| `category` | Loại: Food / Sightseeing / Cafe / Tour / Essentials |
| `lat`, `lng` | Tọa độ thật |
| `google_map_url` | Link địa điểm Google Maps; nếu trống, nút chỉ đường dùng `lat`, `lng` |
| `description` | Mô tả tiếng Anh |
| `what_to_order` | Món nên gọi (tiếng Anh + tiếng Việt) |
| `price_range` | Khoảng giá |
| `opening_hours` | Giờ mở cửa |
| `closing_hours` | Giờ đóng cửa; hiển thị cùng giờ mở cửa |
| `tips` | Mẹo thực tế |
| `image_url` | Link ảnh trên Cloudinary |
| `illus_x`, `illus_y` | Tọa độ số trên bản đồ vẽ tay; đã được đọc nhưng chưa hiển thị ở bản đồ hiện tại |

## 🔐 8. Biến môi trường (`.env.local`)

```env
NEXT_PUBLIC_MAPBOX_TOKEN=        # Mapbox public token
NEXT_PUBLIC_MAPBOX_STYLE_URL=    # mapbox://styles/<user>/<style-id>
GOOGLE_SHEET_CSV_URL=            # Link Sheets đã "Publish to web" dạng CSV
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

## ⚠️ 9. Lưu ý kỹ thuật

- **Code bản đồ:** tách riêng component bản đồ khỏi phần marker và dữ liệu, để sau này thêm bản đồ vẽ tay không phải sửa code cũ.
- **Bản đồ vẽ tay:** giới hạn mức zoom và vùng kéo bản đồ; tự chuyển về Real map khi khách bấm chỉ đường hoặc xem vị trí của mình.
- **Mapbox GL JS:** chỉ chạy được trên trình duyệt, nên component bản đồ phải đánh dấu `"use client"` (có thể kết hợp `dynamic import` với `ssr: false`).
- **Google Sheets:** không gọi trực tiếp từ trình duyệt; đọc ở server và cache lại.
- **Mapbox token:** vào tài khoản Mapbox giới hạn token chỉ dùng được trên domain của web.
- **Ảnh:** dùng tham số của Cloudinary (`w_400,q_auto,f_auto`) để lấy ảnh nhẹ, kết hợp lazy load. Có thể dùng thư viện `next-cloudinary`. Không cho ảnh đi qua bộ tối ưu ảnh của Vercel, để tránh tốn hạn mức miễn phí.

## 🗺️ 10. Lộ trình

| Giai đoạn | Nội dung | Thời gian |
|---|---|---|
| 0 | Thử nhanh bằng Google My Maps + mã QR | 1 ngày |
| 1 | Làm MVP (mục 2) và nhập khoảng 15–20 địa điểm | 2–4 tuần |
| 2 | Thu phản hồi của khách, làm PWA, thêm đa ngôn ngữ | Sau 1–2 tháng |
| 3 | Bản đồ vẽ tay, lộ trình gợi ý, đặt dịch vụ (thêm Supabase) | Khi đã chốt danh sách địa điểm |
