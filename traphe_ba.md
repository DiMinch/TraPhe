**IDEA PROPOSAL**

**TraPhe**

Hệ thống quản lý chuỗi cửa hàng cà phê

*Coffee & Tea Chain Management System*

Phiên bản: 1.0

Năm 2025

# MỤC LỤC

# 1. TỔNG QUAN HỆ THỐNG

## 1.1. Giới thiệu

TraPhe là hệ thống quản lý chuỗi cửa hàng cà phê & trà được thiết kế theo mô hình vận hành tương tự Phúc Long — một trong những chuỗi F&B hàng đầu tại Việt Nam. Hệ thống hướng đến việc số hóa toàn bộ quy trình từ bán hàng online, vận hành tại quầy đến quản trị nội bộ chuỗi.

Tên hệ thống TraPhe kết hợp giữa "Trà" và "Phê" (cà phê), thể hiện hai dòng sản phẩm chủ lực, đồng thời mang nét trẻ trung, gần gũi với thế hệ người dùng hiện đại.

## 1.2. Mục tiêu

* Cung cấp kênh đặt hàng online tiện lợi cho khách hàng (pick-up và delivery) với trải nghiệm tuỳ chỉnh món linh hoạt.
* Hỗ trợ nhân viên vận hành tại quầy thông qua giao diện POS đơn giản, nhanh chóng.
* Quản lý kho nguyên liệu theo từng chi nhánh với khả năng trừ tự động theo công thức pha chế.
* Xây dựng hệ sinh thái loyalty (tích điểm, đổi quà, khuyến mãi) dùng chung toàn chuỗi.
* Cung cấp báo cáo doanh thu, tồn kho và phân tích kinh doanh cho quản lý chi nhánh và admin hệ thống.

## 1.3. Phạm vi hệ thống

Hệ thống TraPhe gồm 3 phân hệ chính vận hành song song:

| **Phân hệ** | **Đối tượng sử dụng** | **Mô tả** |
| --- | --- | --- |
| Customer Web | Khách hàng (Guest, Customer) | Xem menu, đặt đồ uống (pick-up/delivery), mua merchandise, theo dõi đơn, loyalty |
| POS tại quầy | Cashier, Barista | Tạo đơn trực tiếp, nhận thanh toán, quản lý hàng đợi pha chế |
| Admin / Management | Branch Manager, Admin | Quản lý menu, kho nguyên liệu, nhân viên, báo cáo, loyalty, cấu hình hệ thống |

## 1.4. Sản phẩm & Dịch vụ

* Đồ uống: cà phê, trà, trà sữa, nước ép, sinh tố — hỗ trợ tuỳ chọn size, đường, đá, topping.
* Bánh & thức ăn nhẹ: các loại bánh ăn kèm đồ uống.
* Merchandise: bột cà phê, trà đóng gói, combo, gift set — có thể mua online và ship về nhà.
* Combo / Gift set: kết hợp đồ uống và merchandise với giá ưu đãi.

## 1.5. Đặc điểm nghiệp vụ nổi bật

* Giỏ hàng hỗn hợp: khách có thể đặt đồ uống (pick-up/delivery) và mua merchandise trong cùng một phiên. Hệ thống xử lý thành 2 đơn riêng nhưng chỉ có 1 giao dịch thanh toán chung.
* Menu theo chi nhánh: mỗi chi nhánh có thể kích hoạt/vô hiệu hoá từng món. Khi khách chọn địa chỉ delivery hoặc chi nhánh pick-up, những món không có tại chi nhánh đó sẽ hiển thị trạng thái không khả dụng.
* Delivery thông minh: hệ thống tự gợi ý chi nhánh gần nhất kèm phí ship ước tính, khách có thể tự chọn chi nhánh khác.
* Trừ nguyên liệu tự động: khi Barista xác nhận hoàn thành đơn, hệ thống tự động trừ nguyên liệu theo công thức pha chế của từng món và gửi cảnh báo khi tồn kho thấp.
* Loyalty pool chung: điểm tích luỹ được sử dụng tại tất cả chi nhánh trong chuỗi.

## 1.6. Tính năng AI Tích hợp (Sprint 2)

Hệ thống được nâng cấp với các tính năng thông minh để tối ưu vận hành và cá nhân hoá trải nghiệm:
* **Dự báo nhu cầu nguyên liệu (AI Forecasting):** Sử dụng thuật toán Holt-Winters (Double Exponential Smoothing) để phân tích dữ liệu bán hàng quá khứ, dự báo số lượng tiêu thụ nguyên liệu trong 7 ngày tới, giúp Branch Manager chuẩn bị tồn kho chính xác.
* **Phân nhóm khách hàng (RFM Segmentation):** Đánh giá khách hàng theo Recency (Độ mới), Frequency (Tần suất) và Monetary (Giá trị chi tiêu) để tự động xếp loại khách hàng (VIP, Churn Risk, Loyal...), hỗ trợ chiến dịch Marketing hiệu quả.
* **Gợi ý chi nhánh thông minh (Smart Branch Suggestion):** Thuật toán kết hợp khoảng cách địa lý (Haversine) và lưu lượng đơn hàng hiện tại (Queue Load) để gợi ý chi nhánh tối ưu nhất cho khách hàng.
* **Gợi ý bán chéo (Upsell Recommendation):** Sử dụng thuật toán Apriori/Association Rules khai phá luật kết hợp từ lịch sử đơn hàng để gợi ý món ăn kèm (Toppings, Bánh) khi khách thêm món vào giỏ.
* **Tối ưu hiệu suất:** Sử dụng JOIN FETCH, Pagination và các Index trên CSDL để xử lý nhanh báo cáo thống kê và đơn hàng lớn.

# 2. DANH SÁCH ACTOR

| **STT** | **Actor** | **Loại** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | Guest | Người dùng chưa đăng nhập | Xem menu, xem thông tin chi nhánh và thương hiệu. Không thể đặt hàng hay dùng loyalty. |
| 2 | Customer | Khách hàng đã đăng ký | Đặt đồ uống (pick-up/delivery), mua merchandise, theo dõi đơn, tích điểm, đổi quà, dùng voucher. |
| 3 | Cashier | Nhân viên thu ngân | Tạo đơn POS tại quầy, nhận thanh toán (tiền mặt/QR), tra cứu tài khoản khách để áp điểm/voucher, xác nhận đơn pick-up online đã giao. |
| 4 | Barista | Nhân viên pha chế | Xem danh sách đơn cần pha theo thứ tự, cập nhật trạng thái đang pha và hoàn thành. |
| 5 | Branch Manager | Quản lý chi nhánh | Quản lý menu chi nhánh, kho nguyên liệu, nhân viên thuộc chi nhánh, xem báo cáo chi nhánh. |
| 6 | System Admin | Quản trị hệ thống | Quản lý toàn bộ chuỗi: tạo/sửa chi nhánh, menu gốc, cấu hình hệ thống, loyalty & khuyến mãi, xem báo cáo tổng hợp. |
| 7 | System | Tác nhân tự động | Tự động trừ nguyên liệu khi đơn hoàn thành, tính điểm loyalty, gửi thông báo trạng thái đơn, cảnh báo tồn kho thấp. |

# 3. DANH SÁCH USECASE

## 3.1. Module Xác thực & Tài khoản

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC01 | Đăng ký tài khoản | Guest | Nhập email/SĐT, mật khẩu (≥8 ký tự, có chữ hoa + chữ thường + số), họ tên. Hệ thống tạo tài khoản Customer, gửi OTP xác thực email (6 số, hết hạn 5 phút). Trả về access token (15 phút) + refresh token (7 ngày) ngay sau đăng ký nhưng đánh dấu `isEmailVerified = false`. |
| UC01a | Xác thực email (OTP) | Customer | Nhập mã OTP 6 số nhận qua email → hệ thống validate với Redis → cập nhật `isEmailVerified = true`. OTP single-use, tự hủy sau khi dùng hoặc hết hạn 5 phút. |
| UC01b | Gửi lại OTP | Guest, Customer | Gửi lại mã OTP xác thực email hoặc đặt lại mật khẩu. Chặn gửi lại nếu email đã verified (cho loại EMAIL_VERIFY). |
| UC02 | Đăng nhập | Tất cả actor | Đăng nhập bằng email + mật khẩu → hệ thống xác thực qua Spring Security + BCrypt → cấp JWT access token (15 phút, chứa roles claim) + refresh token (7 ngày, chứa type=REFRESH). Rate limit: 5 lần/15 phút theo IP. |
| UC02a | Lấy thông tin user hiện tại | Tất cả actor (đã đăng nhập) | `GET /api/auth/me` — Trả về profile user từ JWT: id, email, fullName, phoneNumber, avatarUrl, isEmailVerified, roles. Yêu cầu access token hợp lệ. |
| UC02b | Làm mới token | Tất cả actor | Gửi refresh token → hệ thống kiểm tra: (1) là refresh token không phải access, (2) chưa bị blacklist trong Redis, (3) chưa hết hạn → cấp access token mới, giữ nguyên refresh token cũ. |
| UC02c | Đăng xuất | Tất cả actor (đã đăng nhập) | Client gửi refresh token → hệ thống thêm hash SHA-256 của token vào Redis blacklist với TTL = thời gian còn lại của token. Client xóa tokens ở local storage. |
| UC03 | Quản lý hồ sơ cá nhân | Customer | Xem/sửa tên, SĐT, địa chỉ giao hàng mặc định. |
| UC03a | Đổi mật khẩu | Tất cả actor (đã đăng nhập) | Nhập mật khẩu hiện tại + mật khẩu mới (≥8 ký tự, chữ hoa + thường + số). Hệ thống verify mật khẩu cũ bằng BCrypt, kiểm tra mật khẩu mới khác mật khẩu cũ → encode + lưu. |
| UC03b | Quên mật khẩu | Guest | Nhập email → hệ thống gửi OTP reset (6 số, 5 phút) qua email. **Luôn trả 200** kể cả email không tồn tại (chống email enumeration). |
| UC03c | Đặt lại mật khẩu | Guest | Nhập email + OTP + mật khẩu mới → hệ thống validate OTP từ Redis → encode mật khẩu mới → lưu. OTP single-use. |
| UC04 | Quản lý tài khoản nhân viên | Admin, Branch Manager | CRUD tài khoản nhân viên, gán role (Cashier/Barista/Branch Manager), gán chi nhánh. |

### Chi tiết kỹ thuật Auth

**Security Stack:**
- Spring Security 6 + BCryptPasswordEncoder
- JWT (JJWT 0.13): access token 15 phút, refresh token 7 ngày
- Access token chứa claims: `sub` (email), `roles` (list), `type` (ACCESS), `exp`, `iat`
- Refresh token chứa claims: `sub` (email), `type` (REFRESH), `exp`, `iat`
- JwtAuthenticationFilter: parse Bearer token → validate → reject refresh tokens dùng như access → check blacklist Redis
- JwtAuthenticationEntryPoint: trả JSON 401 thay vì HTML mặc định

**OTP & Redis:**
- Redis lưu OTP: key `otp:{type}:{email}`, value = 6-digit code, TTL = 5 phút
- Redis lưu token blacklist: key `blacklist:{sha256_hash}`, value = "revoked", TTL = remaining expiry
- OTP single-use (xóa sau khi validate thành công)

**Email:**
- Mailtrap sandbox (dev) / Gmail SMTP (prod)
- Fallback: log OTP ra console khi MAIL_USERNAME rỗng

**API Endpoints:**

| Method | Endpoint | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Đăng ký + gửi OTP email |
| POST | `/api/auth/verify-email` | Public | Xác thực email bằng OTP |
| POST | `/api/auth/resend-otp` | Public | Gửi lại OTP (EMAIL_VERIFY / PASSWORD_RESET) |
| POST | `/api/auth/login` | Public | Đăng nhập → tokens |
| GET | `/api/auth/me` | Bearer | Thông tin user hiện tại |
| POST | `/api/auth/refresh` | Public | Làm mới access token |
| POST | `/api/auth/logout` | Bearer | Thu hồi refresh token |
| PUT | `/api/auth/change-password` | Bearer | Đổi mật khẩu |
| POST | `/api/auth/forgot-password` | Public | Gửi OTP reset mật khẩu |
| POST | `/api/auth/reset-password` | Public | Đặt lại mật khẩu bằng OTP |

## 3.2. Module Menu & Sản phẩm

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC05 | Quản lý menu gốc (master menu) | Admin | CRUD menu item kèm inline sizes (S/M/L), liên kết option groups (SUGAR/ICE/TEMPERATURE) và toppings. Soft delete. Tự động xoá cache Redis khi thay đổi. |
| UC05a | Tạo menu item | Admin | `POST /api/admin/menu-items` — tạo item + sizes + option groups + toppings trong 1 request. Trả về `MenuItemDetailResponse`. |
| UC05b | Cập nhật menu item | Admin | `PUT /api/admin/menu-items/{id}` — cập nhật partial (chỉ field được gửi). Nếu gửi sizes/optionGroupIds/toppingIds → replace toàn bộ. |
| UC05c | Xoá menu item (soft) | Admin | `DELETE /api/admin/menu-items/{id}` — đánh dấu `is_deleted = true`, không xoá vật lý. |
| UC06 | Quản lý menu chi nhánh | Branch Manager, Admin | `PUT /api/branches/{id}/menu` — bật/tắt món (`isAvailable`), đặt `customPrice`, ghi `unavailableReason`. **BRANCH_MANAGER chỉ được quản lý chi nhánh mình** (kiểm tra `users.branch_id`). |
| UC07 | Xem menu | Guest, Customer | Xem danh sách món + chi tiết. Khi có `branchId` → JOIN `branch_menu_items` để hiện giá riêng và trạng thái available. |
| UC07a | Xem menu dạng cây | Guest, Customer | `GET /api/menu/tree` — trả categories → items → subcategories (recursive). Hỗ trợ `branchId` optional. |
| UC07b | Xem chi tiết món | Guest, Customer | `GET /api/menu/{id}?branchId=...` — trả sizes, option groups + values, toppings. Nếu có `branchId` → apply `customPrice` fallback `basePrice`. |

### Chi tiết kỹ thuật Menu & Branch

**API Endpoints:**

| Method | Endpoint | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/menu` | Public | Danh sách menu items (paginated, filter, sort). `branchId` optional → overlay giá + availability |
| GET | `/api/menu/tree` | Public | Menu dạng cây (categories → items). `branchId` optional |
| GET | `/api/menu/{id}` | Public | Chi tiết menu item + sizes/options/toppings. `branchId` optional |
| GET | `/api/menu/categories` | Public | Danh sách danh mục (search, filter by parent, sort) |
| GET | `/api/menu/toppings` | Public | Danh sách topping (search, filter isAvailable, paginated) |
| POST | `/api/menu/upload-image` | ADMIN | Upload ảnh lên Supabase Storage |
| DELETE | `/api/menu/images` | ADMIN | Xoá ảnh trên Supabase Storage |
| POST | `/api/admin/menu-items` | ADMIN | Tạo menu item (kèm sizes, option groups, toppings) |
| PUT | `/api/admin/menu-items/{id}` | ADMIN | Cập nhật menu item |
| DELETE | `/api/admin/menu-items/{id}` | ADMIN | Soft delete menu item |
| GET | `/api/branches` | Public | Danh sách chi nhánh (paginated, search, filter isActive) |
| GET | `/api/branches/{id}` | Public | Chi tiết chi nhánh + giờ mở cửa |
| GET | `/api/branches/{id}/menu` | Public | Menu của chi nhánh (paginated, search, filter isAvailable) |
| PUT | `/api/branches/{id}/menu` | ADMIN, BRANCH_MANAGER | Cập nhật trạng thái/giá menu tại chi nhánh |

**Performance & Caching:**
- Redis cache cho tất cả GET menu endpoints (TTL: items/tree 5 phút, categories 15 phút, toppings 10 phút)
- `@CacheEvict` trên tất cả admin write operations → tự động invalidate cache
- N+1 fix: batch-fetch sizes bằng `findByMenuItemIdInAndIsDeletedFalse()` thay vì query 1-by-1
- Branch overlay: batch-fetch `BranchMenuItem` bằng `findAllByBranchIdAndMenuItemIdIn()` cho page kết quả

**RBAC:**
- `ADMIN` → full CRUD menu + quản lý tất cả chi nhánh
- `BRANCH_MANAGER` → chỉ quản lý chi nhánh được gán (`users.branch_id` must match)
- `CUSTOMER/Guest` → chỉ GET

## 3.3. Module Đặt hàng Online

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC08 | Đặt đồ uống (Pick-up) | Customer | Chọn chi nhánh pick-up → chọn món + tuỳ chọn (size/đường/đá/topping) → thêm giỏ → thanh toán. Đơn gắn với chi nhánh đã chọn. |
| UC09 | Đặt đồ uống (Delivery) | Customer | Nhập địa chỉ → hệ thống gợi ý chi nhánh gần nhất kèm phí ship → khách confirm hoặc tự chọn chi nhánh khác → chọn món → thanh toán. |
| UC10 | Mua Merchandise | Customer | Xem danh sách merchandise → thêm giỏ (không cần chọn chi nhánh). Dùng `POST /api/orders/merchandise`. Validate `isDrink = false`. |
| UC11 | Thanh toán gộp | Customer | `POST /api/orders/checkout` — tạo `combined_checkouts` record gộp 1-2 đơn (drink + merchandise). Xử lý 1 giao dịch duy nhất. Hỗ trợ VNPay/MoMo/Cash/QR. |
| UC12 | Theo dõi trạng thái đơn | Customer | Xem trạng thái đơn đồ uống (Tiếp nhận → Đang pha → Sẵn sàng/Đang giao → Hoàn thành) và đơn merchandise (Xử lý → Đang giao → Hoàn thành). |
| UC13 | Huỷ đơn | Customer | Chỉ huỷ khi đơn ở trạng thái Tiếp nhận (chưa pha/chưa xuất kho). Hoàn tiền hoặc hoàn điểm nếu đã dùng. |

### Chi tiết kỹ thuật Module Đặt hàng

**API Endpoints:**

| Method | Endpoint | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/orders/drink` | CUSTOMER | Tạo đơn đồ uống. Yêu cầu `branchId`. Hỗ trợ size/options/toppings. Batch-fetch N+1 fix. |
| POST | `/api/orders/merchandise` | CUSTOMER | Tạo đơn merchandise. Validate `isDrink = false`. Dùng `basePrice`. Cần `shippingAddress`. |
| POST | `/api/orders/checkout` | CUSTOMER | Thanh toán gộp. Nhận `drinkOrderId` + `merchandiseOrderId` (ít nhất 1). Tạo `combined_checkouts`. Mock payment → auto CONFIRMED. |
| PUT | `/api/orders/{id}/status` | Authenticated | Chuyển trạng thái: PENDING → CONFIRMED → COMPLETED. |
| DELETE | `/api/orders/{id}` | CUSTOMER | Huỷ đơn. Hoàn điểm + refund nếu đã thanh toán. |

**Pricing Logic:**
- **Drink**: `customPrice (branch)` → `sellingPrice (size)` → `basePrice (item)`. Topping: `itemSubtotal = quantity × (unitPrice + SUM(toppingPrice))`.
- **Merchandise**: Chỉ dùng `basePrice`. Không có size/options/toppings.

**Combined Checkout Flow:**
1. FE tạo 2 đơn riêng (`/drink` + `/merchandise`) → status = PENDING
2. FE gọi `/checkout` gộp 2 orderId → hệ thống validate ownership, status PENDING, chưa checkout trước đó
3. Tạo `combined_checkouts` record + mock payment
4. Nếu payment success → cả 2 orders chuyển `paymentStatus = COMPLETED`, `status = CONFIRMED`
5. Toàn bộ flow trong `@Transactional` — đảm bảo tính nhất quán

**Idempotency:**
- Mỗi checkout sinh `transactionRef` unique (format `CK-YYYYMMDD-XXXXXXXX`)
- Kiểm tra duplicate: `existsByDrinkOrderId()` / `existsByMerchandiseOrderId()` trước khi tạo

## 3.4. Module POS tại quầy

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC14 | Tạo đơn POS | Cashier | Giao diện chọn món nhanh (theo danh mục, tìm kiếm), chọn tuỳ chọn size/đường/đá/topping, thêm nhiều món, xem tổng tiền. Hỗ trợ take-away và tại chỗ. |
| UC15 | Áp dụng KM/điểm tại POS | Cashier | Quét/nhập mã voucher hoặc tra tài khoản khách (SĐT/QR thẻ thành viên) để áp điểm loyalty hoặc voucher vào đơn POS. |
| UC16 | Thanh toán tại quầy | Cashier | Nhận tiền mặt (tính tiền thừa) hoặc QR (VNPay/MoMo). Xác nhận thanh toán thành công → đơn vào hàng đợi pha chế. |
| UC17 | Xem hàng đợi pha chế | Barista, Cashier | Danh sách đơn theo thứ tự thời gian, hiển thị chi tiết món và tuỳ chọn. Gồm cả đơn POS và đơn online pick-up đã thanh toán tại chi nhánh. |
| UC18 | Cập nhật trạng thái pha chế | Barista | Cập nhật Đang pha → Hoàn thành cho từng đơn. Khi hoàn thành, hệ thống tự trừ nguyên liệu và thông báo cho khách (đơn online). |

## 3.5. Module Quản lý Chi nhánh & Kho nguyên liệu

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC19 | Quản lý chi nhánh | Admin | CRUD chi nhánh (tên, địa chỉ, toạ độ, giờ mở cửa, SĐT). Kích hoạt/tạm đóng chi nhánh. |
| UC20 | Quản lý nguyên liệu & công thức | Admin | CRUD danh mục nguyên liệu (tên, đơn vị). Thiết lập công thức pha chế cho từng sản phẩm theo size (ví dụ: Cà phê sữa size M = 30ml espresso + 100ml sữa). |
| UC21 | Quản lý kho nguyên liệu chi nhánh | Branch Manager | Xem tồn kho, nhập nguyên liệu (ghi phiếu nhập + nhà cung cấp), điều chỉnh kho thủ công (hao hụt, kiểm kê). |
| UC22 | Trừ nguyên liệu tự động | System | Khi Barista xác nhận hoàn thành đơn, hệ thống tự trừ nguyên liệu theo công thức. Gửi cảnh báo cho Branch Manager khi tồn kho xuống dưới ngưỡng. |
| UC23 | Quản lý nhà cung cấp | Admin, Branch Manager | CRUD nhà cung cấp nguyên liệu, ghi lịch sử nhập hàng theo chi nhánh. |

## 3.6. Module Loyalty & Khuyến mãi

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC24 | Tích điểm | System, Customer | Sau mỗi đơn hoàn thành (online hoặc POS khi tra tài khoản), hệ thống tự cộng điểm. Pool điểm dùng chung toàn chuỗi. |
| UC25 | Đổi điểm lấy quà/giảm giá | Customer, Cashier | Online: chọn đổi điểm khi checkout. Tại quầy: Cashier tra tài khoản và áp điểm vào đơn POS. |
| UC26 | Quản lý hạng thành viên | Admin | Thiết lập ngưỡng hạng (Bronze/Silver/Gold/Platinum). Mỗi hạng có hệ số tích điểm và ưu đãi riêng. |
| UC27 | Quản lý khuyến mãi | Admin | Tạo chương trình KM: giảm % hoặc giảm tiền, áp dụng toàn hệ thống hoặc theo chi nhánh/danh mục/khung giờ (happy hour). Thiết lập điều kiện áp dụng. |
| UC28 | Quản lý voucher | Admin | Tạo voucher theo batch (mã tự động hoặc cố định), giới hạn số lần dùng, thời hạn. Voucher có thể tặng qua event hoặc loyalty milestone. |
| UC29 | Áp dụng voucher/KM | Customer, Cashier | Nhập mã voucher, hệ thống validate và hiển thị số tiền giảm trước khi thanh toán. |

## 3.7. Module Báo cáo & Thống kê

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC30 | Báo cáo doanh thu | Admin, Branch Manager | Theo ngày/tuần/tháng/năm. Admin xem toàn chuỗi và so sánh chi nhánh. Branch Manager chỉ xem chi nhánh mình. |
| UC31 | Báo cáo món bán chạy | Admin, Branch Manager | Xếp hạng sản phẩm theo doanh số và số lượng bán, theo chi nhánh và toàn hệ thống. |
| UC32 | Báo cáo tồn kho nguyên liệu | Admin, Branch Manager | Xem tồn kho hiện tại, lịch sử nhập/xuất, dự báo hết hàng dựa trên tốc độ tiêu thụ. |
| UC33 | Báo cáo loyalty | Admin | Thống kê điểm đã phát/đã đổi, số thành viên theo hạng, tỉ lệ quay lại. |
| UC34 | Nhật ký hệ thống | Admin | Ghi lại mọi thao tác quan trọng: tạo/sửa/xoá menu, điều chỉnh kho, thay đổi giá, phân quyền. |

## 3.8. Module Thông tin thương hiệu & Cấu hình

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC35 | Xem thông tin thương hiệu | Guest, Customer | Xem các trang tĩnh: Câu chuyện thương hiệu, Sứ mệnh & Giá trị, Hệ thống chi nhánh, Liên hệ. Nội dung set cứng, không cần CMS. |
| UC36 | Cấu hình hệ thống | Admin | Tên thương hiệu, logo, thông tin liên hệ, cấu hình phí ship (theo km), ngưỡng cảnh báo tồn kho mặc định, cấu hình giờ happy hour. |

## 3.9. Module Trí tuệ Nhân tạo (AI & Data)

| **Mã UC** | **Tên Usecase** | **Actor chính** | **Mô tả ngắn** |
| --- | --- | --- | --- |
| UC37 | Dự báo nhu cầu nguyên liệu | Admin, Branch Manager | Xem biểu đồ dự báo nhu cầu nguyên liệu trong 7 ngày tới dựa trên phân tích Holt-Winters, độ tin cậy được tính bằng số ngày có dữ liệu. |
| UC38 | Xem phân khúc khách hàng (RFM) | Admin | Dashboard phân loại khách hàng thành các nhóm (VIP, Active, Churn Risk, Lost) theo mô hình RFM, hỗ trợ xem tỷ lệ % và số lượng. |
| UC39 | Nhận gợi ý chi nhánh tối ưu | Customer | Khi chọn đặt Delivery, hệ thống tự động tính toán tổng hợp (khoảng cách + số đơn đang chờ tại quầy) để đề xuất chi nhánh giao hàng nhanh nhất. |
| UC40 | Nhận gợi ý món Upsell | Customer | Khách hàng thêm 1 món vào giỏ, hệ thống dùng luật kết hợp (Association Rules) gợi ý 2-3 món thường được mua kèm nhiều nhất. |

# 4. TIMELINE TRIỂN KHAI 4 TUẦN

Nhóm 3 người: 1 Frontend Developer (FE), 2 Backend Developer (BE1 và BE2).

Stack: React + Vite + TypeScript (FE) | Spring Boot + PostgreSQL/Supabase (BE).

Mỗi ngày trung bình 3–5 commits có ý nghĩa. Commit message theo convention feat/fix/chore/refactor(module): mô tả.

## Tuần 1 — Setup & Core Foundation (Ngày 1–7)

| **Ngày** | **Trọng tâm** | **FE** | **BE1 & BE2** |
| --- | --- | --- | --- |
| 1 | Project Setup | Khởi tạo Vite + TS, cấu hình ESLint/Prettier/Tailwind/shadcn, folder structure, cài Axios + React Router v6. | BE1: Khởi tạo Spring Boot, dependencies, application.yml, BaseEntity. BE2: Tạo schema DB — users, roles, user\_roles, user\_providers. |
| 2 | Auth | Trang Login/Register, AuthContext, useAuth hook, Axios interceptor JWT + refresh logic, ProtectedRoute. | BE1: Spring Security config, JwtUtil, UserDetailsServiceImpl. BE2: POST /api/auth/login, /register, /refresh. GlobalExceptionHandler. |
| 3 | Menu & Product | Trang danh sách sản phẩm (grid card, phân trang, filter), trang chi tiết món (ảnh, mô tả, tuỳ chọn size/đường/đá/topping). | BE1: Schema categories, menu\_items, item\_sizes, item\_options, toppings. BE2: GET /api/menu, /api/menu/:id, upload ảnh Supabase Storage. |
| 4 | Branch Menu | Logic disable món theo chi nhánh/địa chỉ đã chọn, hiển thị badge 'Không có tại chi nhánh này'. | BE1: Schema branches, branch\_menu\_items, branch\_hours. BE2: GET /api/branches, API quản lý menu chi nhánh (Admin/Manager). |
| 5 | Giỏ hàng & Checkout UI | CartContext (drink cart + merch cart riêng), trang giỏ hàng hỗn hợp, UI checkout chọn pick-up/delivery, chọn chi nhánh, gợi ý chi nhánh gần. | BE1: Schema orders, order\_items, order\_item\_options. BE2: Schema merchandise\_orders, merchandise\_order\_items. Logic tách đơn khi thanh toán gộp. |
| 6 | Order API | Tích hợp API tạo đơn, trang xác nhận đặt hàng thành công, trang lịch sử đơn hàng (customer). | BE1: POST /api/orders/drink — tạo đơn đồ uống, check chi nhánh. BE2: POST /api/orders/merchandise — tạo đơn merchandise. POST /api/orders/checkout — gộp thanh toán. |
| 7 | Order Tracking | Trang theo dõi trạng thái đơn (đồ uống & merchandise), trang huỷ đơn. | BE1: PUT /api/orders/:id/status — cập nhật trạng thái. BE2: DELETE /api/orders/:id — huỷ đơn (validate điều kiện), logic hoàn điểm/tiền. |

## Tuần 2 — POS & Kho nguyên liệu (Ngày 8–14)

| **Ngày** | **Trọng tâm** | **FE** | **BE1 & BE2** |
| --- | --- | --- | --- |
| 8 | POS — Tạo đơn | Giao diện POS: layout 2 cột (menu bên trái, giỏ bên phải), chọn danh mục, tìm kiếm món, chọn tuỳ chọn size/đường/đá/topping nhanh. | BE1: API GET /api/pos/menu — menu theo chi nhánh POS. BE2: POST /api/pos/orders — tạo đơn POS, validate tồn kho. |
| 9 | POS — Thanh toán | UI thanh toán tại quầy: nhập số tiền mặt (tính thừa tự động), QR code hiển thị, xác nhận thanh toán thành công. | BE1: POST /api/pos/payment — xử lý thanh toán (cash/QR), cập nhật trạng thái đơn. BE2: Logic tra cứu khách hàng qua SĐT để áp điểm/voucher tại POS. |
| 10 | Hàng đợi pha chế | Trang hàng đợi pha chế: danh sách đơn theo thứ tự, hiển thị chi tiết món + tuỳ chọn rõ ràng, nút cập nhật trạng thái. | BE1: GET /api/pos/queue — danh sách đơn chờ pha theo chi nhánh (gồm POS + online pick-up). BE2: PUT /api/pos/orders/:id/brewing-status — Đang pha / Hoàn thành. |
| 11 | Nguyên liệu & Công thức | Trang quản lý nguyên liệu (Admin): CRUD, đơn vị tính. Trang công thức pha chế: gán nguyên liệu theo món + size. | BE1: Schema ingredients, recipes, recipe\_items. BE2: CRUD /api/admin/ingredients, /api/admin/recipes. Logic validate công thức. |
| 12 | Kho chi nhánh | Trang kho chi nhánh (Branch Manager): xem tồn kho, form nhập nguyên liệu, lịch sử nhập. | BE1: Schema ingredient\_stock (theo chi nhánh), stock\_transactions, suppliers. BE2: GET/POST /api/branch/stock. POST /api/branch/stock/import. CRUD suppliers. |
| 13 | Trừ nguyên liệu tự động | Dashboard tồn kho: cảnh báo màu đỏ khi nguyên liệu dưới ngưỡng, số lượng ước tính còn pha được. | BE1: Logic trừ nguyên liệu khi Barista confirm hoàn thành đơn (theo công thức + số lượng từng món). BE2: Logic gửi thông báo in-app khi tồn kho < ngưỡng cảnh báo. |
| 14 | Điều chỉnh kho & Buffer | Trang điều chỉnh kho thủ công (hao hụt, kiểm kê), lịch sử giao dịch kho. | BE1: POST /api/branch/stock/adjust — điều chỉnh thủ công với lý do. BE2: Fix bug tuần 1–2, chuẩn hoá error response, viết unit test Service layer. |

## Tuần 3 — Loyalty, Khuyến mãi & Admin (Ngày 15–21)

| **Ngày** | **Trọng tâm** | **FE** | **BE1 & BE2** |
| --- | --- | --- | --- |
| 15 | Loyalty — Tích điểm | Trang hồ sơ loyalty: hạng thành viên hiện tại, điểm tích luỹ, lịch sử điểm, thanh tiến trình đến hạng tiếp theo. | BE1: Schema loyalty\_accounts, loyalty\_transactions, membership\_tiers. BE2: Logic cộng điểm sau đơn hoàn thành. Logic tự nâng hạng theo tổng chi tiêu. |
| 16 | Loyalty — Đổi quà | Trang đổi quà: danh sách quà/ưu đãi, xác nhận đổi. Tích hợp dùng điểm trong checkout online. | BE1: Schema reward\_catalogue, reward\_redemptions. BE2: POST /api/loyalty/redeem. Logic trừ điểm, validate số dư, tạo voucher nếu đổi giảm giá. |
| 17 | Khuyến mãi & Voucher | Trang quản lý KM (Admin): CRUD, chọn phạm vi áp dụng, khung giờ. Trang quản lý voucher: tạo batch, xem danh sách. | BE1: Schema promotions, promotion\_rules, vouchers. BE2: Logic validate KM (ngày, conflict, điều kiện đơn tối thiểu). POST /api/vouchers/validate. |
| 18 | Áp KM vào đơn | Tích hợp input voucher/KM vào Checkout online và POS. Hiển thị breakdown giảm giá rõ ràng trước thanh toán. | BE1: Logic áp dụng KM + voucher vào đơn (ưu tiên, xếp chồng). BE2: Cập nhật POST /api/orders/checkout nhận voucher\_code và promotion\_ids. |
| 19 | RBAC & Nhân viên | Trang quản lý nhân viên (Admin/Manager): CRUD, gán role, gán chi nhánh. Route guard theo role. | BE1: @PreAuthorize bảo vệ toàn bộ admin/manager endpoint. BE2: CRUD /api/admin/staff. PUT /api/admin/staff/:id/role. PUT /api/admin/staff/:id/branch. |
| 20 | Quản lý chi nhánh | Trang quản lý chi nhánh (Admin): CRUD, bản đồ toạ độ (input lat/lng), giờ mở cửa, toggle trạng thái. | BE1: CRUD /api/admin/branches. Logic tính chi nhánh gần nhất (Haversine formula). BE2: API GET /api/branches/nearest?lat=...&lng=... trả danh sách chi nhánh kèm khoảng cách và phí ship. |
| 21 | Trang thương hiệu & Audit Log | Các trang tĩnh: Về TraPhe, Câu chuyện, Sứ mệnh, Hệ thống chi nhánh, Liên hệ. Nội dung set cứng trong component. | BE1: Schema audit\_logs. AuditLog interceptor (log CUD operations). BE2: CRUD /api/admin/system-config. GET /api/admin/audit-logs (filter theo user/action/date). |

## Tuần 4 — Báo cáo, Polish & Deploy (Ngày 22–28)

| **Ngày** | **Trọng tâm** | **FE** | **BE1 & BE2** |
| --- | --- | --- | --- |
| 22 | Dashboard & Báo cáo | Dashboard Admin: KPI cards (doanh thu hôm nay, đơn đang xử lý, nguyên liệu sắp hết). Dashboard Branch Manager tương tự nhưng chỉ chi nhánh mình. | BE1: GET /api/reports/revenue?period=day|week|month|year (toàn chuỗi + từng chi nhánh). BE2: GET /api/reports/top-products. GET /api/reports/stock-forecast. |
| 23 | Biểu đồ & Export | Biểu đồ doanh thu (Recharts line chart), biểu đồ top sản phẩm (bar chart), biểu đồ tồn kho (gauge/bar). Nút export CSV. | BE1: GET /api/reports/loyalty-stats. BE2: GET /api/reports/export?type=csv&report=revenue. GET /api/reports/inventory. |
| 24 | Integration Test | Test toàn bộ luồng chính: đăng ký → đặt đồ uống pick-up → POS nhận → Barista pha → nguyên liệu trừ → điểm cộng. | BE1: Fix bug integration: đơn gộp thanh toán, trừ nguyên liệu đồng thời nhiều đơn. BE2: Test edge cases: hết tồn kho giữa chừng, KM hết hạn, JWT expire. |
| 25 | UI Polish | Toast notifications, loading skeletons, empty states. Form validation (React Hook Form + Zod). Responsive mobile/tablet cho customer web và POS. | BE1: Chuẩn hoá API error response format. Thêm request validation (Bean Validation). BE2: Tối ưu query N+1 (fetch join). Cấu hình connection pool. |
| 26 | Performance & Security | Lazy load routes, code splitting. Tối ưu bundle size. Kiểm tra UX luồng checkout trên mobile. | BE1: Rate limiting cho auth endpoint. Input sanitization. BE2: Kiểm tra CORS config production. Cấu hình HTTPS. Review JWT secret rotation. |
| 27 | Deploy | Build production. Deploy FE lên Vercel, config env variables. Smoke test trên production URL. | BE1: Viết Dockerfile, docker-compose.yml (app + postgres). BE2: Deploy BE lên Railway/Render. Config production DB (Supabase). Setup CI/CD cơ bản. |
| 28 | Buffer & Demo Prep | Sửa bug phát sinh trên production. Chuẩn bị demo data (menu, chi nhánh, tài khoản mẫu). | BE1: Seed data thực tế: menu TraPhe đầy đủ, 3 chi nhánh mẫu, nguyên liệu + công thức. BE2: Viết README hướng dẫn setup. Cập nhật API documentation (Swagger). |

# 5. SO SÁNH VỚI HỆ THỐNG PC SHOP

Hệ thống TraPhe được phát triển dựa trên nền tảng kiến trúc tương tự PC Shop Management nhưng có nhiều điều chỉnh quan trọng để phù hợp với nghiệp vụ F&B.

| **Khía cạnh** | **PC Shop** | **TraPhe** |
| --- | --- | --- |
| Product / Variant | Sản phẩm có variants (màu, RAM...) | MenuItem + tuỳ chọn động (size/đường/đá/topping) |
| Order flow | 1 loại đơn hàng duy nhất | 2 loại đơn riêng (drink + merchandise) có thể gộp thanh toán |
| Inventory | Quản lý hàng hoá theo serial number | Quản lý nguyên liệu theo đơn vị (ml, gram), trừ theo công thức |
| Branch | Không có (single store) | Multi-branch: menu, kho, nhân viên riêng theo chi nhánh |
| POS | Không có | Giao diện POS + hàng đợi pha chế riêng |
| Warranty | Module bảo hành & sửa chữa đầy đủ | Không cần — bỏ hoàn toàn |
| Loyalty | Tích điểm theo đơn | Pool điểm chung toàn chuỗi, hạng thành viên với hệ số tích điểm riêng |
| Giữ nguyên | — | Auth/RBAC, Promotion/Voucher, Supplier, Audit Log, Report framework |

# 6. TECH STACK ĐỀ XUẤT

| **Layer** | **Công nghệ** | **Ghi chú** |
| --- | --- | --- |
| Frontend | React 18 + Vite + TypeScript | SPA, code splitting theo route |
| UI Library | Tailwind CSS + shadcn/ui | Component library nhất quán |
| State/Data | TanStack Query + Zustand | Server state + client state tách biệt |
| Form | React Hook Form + Zod | Validation type-safe |
| Charts | Recharts | Dashboard báo cáo |
| Backend | Spring Boot 3.x (Java 17+) | Modular Monolith, RESTful API |
| Database | PostgreSQL (Supabase) | Supabase Storage cho ảnh sản phẩm |
| Auth | JWT (Access 15 phút + Refresh 7 ngày) | Spring Security + BCrypt |
| Payment | VNPay / MoMo sandbox | Online checkout + QR tại quầy |
| Deploy FE | Vercel | Auto-deploy từ GitHub |
| Deploy BE | Railway / Render | Docker container |
| API Docs | Swagger / SpringDoc OpenAPI | Tự động generate từ annotation |

# 7. PHÂN CÔNG TRÁCH NHIỆM

| **Thành viên** | **Trách nhiệm chính** | **Module phụ trách** |
| --- | --- | --- |
| FE Developer | Toàn bộ giao diện người dùng: Customer Web, POS interface, Admin dashboard. Đảm bảo UX nhất quán và responsive. | UC07–UC13 (Customer), UC14–UC18 (POS), UC26–UC29 (KM), UC30–UC33 (Báo cáo), UC35 (Thương hiệu) |
| BE Developer 1 | Core business logic: Auth, Order flow, Inventory/Recipe, POS backend, Loyalty engine. | UC01–UC04, UC08–UC13, UC14–UC18, UC20–UC22, UC24–UC25 |
| BE Developer 2 | Support & Integration: Menu/Branch management, Promotions, Reports, System config, Deploy. | UC05–UC06, UC19, UC23, UC27–UC29, UC30–UC34, UC36, DevOps |