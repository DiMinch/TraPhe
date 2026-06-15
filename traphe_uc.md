# BÁO CÁO RÀ SOÁT & HƯỚNG DẪN KIỂM THỬ HỆ THỐNG TRAPHE
**Dự án:** TraPhe - Coffee & Tea Chain Management System  
**Mục tiêu:** Tổng hợp 40 Use Cases (UC) của 9 phân hệ, đối chiếu mã nguồn thực tế Frontend - Backend và cung cấp các kịch bản kiểm thử (test cases/flows) trực quan cho QA.

---

## I. TỔNG QUAN HỆ THỐNG & CÁC LỖI TÍCH HỢP NỔI BẬT

### 1. Trạng thái cổng thanh toán (Mock Payment)
> [!NOTE]
> Phục vụ cho mục đích kiểm thử dễ dàng, toàn bộ các luồng thanh toán qua VNPay, MoMo, chuyển khoản QR và Tiền mặt của hệ thống ở Backend đã được **MOCK tự động thành công**. 
> Khi thực hiện thanh toán, đơn hàng sẽ ngay lập tức được chuyển sang trạng thái đã thanh toán (`paymentStatus = COMPLETED`) và được xác nhận (`status = CONFIRMED`).

### 2. Các điểm bất đồng bộ nghiêm trọng (Critical Mismatches) - ĐÃ KHẮC PHỤC
> [!NOTE]
> Tất cả 03 lỗi tích hợp payload và endpoint giữa Frontend và Backend đã được sửa đổi và tích hợp đồng bộ:
>
> * **Lỗi Xác thực Email (UC01a) - [RESOLVED]:** Endpoint gọi API xác thực trong `auth.service.ts` đã được cập nhật từ `/auth/verify-signup` thành `/auth/verify-email` tương ứng với `@PostMapping("/verify-email")` của Backend.
> * **Lỗi Sai định dạng SĐT (UC01) - [RESOLVED]:** Hàm `register` trong `auth.service.ts` được cập nhật để tự động ánh xạ thuộc tính `phone` của form thành `phoneNumber` gửi lên Backend DTO (`RegisterRequest.java`), đảm bảo số điện thoại được lưu chính xác trong database.
> * **Lỗi Quy trình Quên/Đặt lại mật khẩu (UC03b & UC03c) - [RESOLVED]:** Trang `forgot-password.tsx` được cập nhật nút điều hướng kèm tham số email. Trang `reset-password.tsx` được thiết kế lại hoàn chỉnh để nhập trực tiếp Email, mã OTP 6 số, và Mật khẩu mới để gửi payload chính xác `{ email, otp, newPassword }` tới API `/auth/reset-password` của Backend.

---

## II. BẢNG MAPPING & HƯỚNG DẪN KIỂM THỬ CHI TIẾT (40 USE CASES)

### 1. Phân hệ Xác thực & Tài khoản (Auth & Accounts)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC01** | Đăng ký tài khoản | **Yes** <br>`POST /api/auth/register` | **Yes** <br>Route `/sign-up` | 1. Vào `/sign-up` <br>2. Nhập các thông tin (Họ tên, Email, SĐT, Mật khẩu). <br>3. Bấm "Đăng ký". | **Đã sửa:** Thuộc tính `phone` được ánh xạ thành `phoneNumber` trước khi gửi lên API, đảm bảo lưu SĐT chính xác trong DB. |
| **UC01a** | Xác thực email (OTP) | **Yes** <br>`POST /api/auth/verify-email` | **Yes** <br>Giao diện Step 2 của `/sign-up` | 1. Sau khi đăng ký, màn hình tự chuyển sang ô nhập OTP. <br>2. Xem mã OTP trong email / console log của BE. <br>3. Nhập 6 số OTP và bấm "Xác thực". | **Đã sửa:** Gọi chính xác API `/verify-email`. Quy trình xác thực hoạt động trơn tru. |
| **UC01b** | Gửi lại OTP | **Yes** <br>`POST /api/auth/resend-otp` | **No** | (Chưa có giao diện) | Chưa có nút hoặc link "Gửi lại OTP" ở màn hình nhập mã xác thực OTP. |
| **UC02** | Đăng nhập | **Yes** <br>`POST /api/auth/login` | **Yes** <br>Route `/sign-in` | 1. Vào `/sign-in` <br>2. Nhập Email và Mật khẩu chính xác. <br>3. Bấm "Đăng nhập". | Đăng nhập thành công sẽ lưu accessToken và refreshToken vào localStorage. Có rate limit (5 lần/15 phút). |
| **UC02a** | Lấy thông tin user hiện tại | **Yes** <br>`GET /api/auth/me` | **Yes** | 1. F5 hoặc chuyển hướng các trang sau khi đăng nhập. | Tự động gọi API `/me` để xác minh token và đồng bộ trạng thái thông tin qua `AuthContext`. |
| **UC02b** | Làm mới token | **Yes** <br>`POST /api/auth/refresh` | **Partial** | (Không có giao diện, là tác vụ ngầm) | **Lưu ý:** Axios client (`axios-client.ts`) chưa cấu hình gọi `/auth/refresh` khi accessToken hết hạn; thay vào đó, khi gặp lỗi 401 nó sẽ xóa thông tin local và đẩy về trang `/sign-in`. |
| **UC02c** | Đăng xuất | **Yes** <br>`POST /api/auth/logout` | **Yes** <br>Button "Đăng xuất" | 1. Click nút "Đăng xuất" ở thanh Header phía Client hoặc thanh Sidebar ở trang Admin. | Xóa sạch tokens ở client và vô hiệu hóa token đó trên Redis ở Backend. |
| **UC03** | Quản lý hồ sơ cá nhân | **Yes** <br>`PUT /api/auth/me` | **Yes** <br>Route `/account` | 1. Vào `/account` -> Tab Profile. <br>2. Thay đổi Họ tên/SĐT. <br>3. Bấm "Lưu thay đổi". | Tích hợp thêm quản lý địa chỉ giao hàng thông qua `UserAddressController`. |
| **UC03a** | Đổi mật khẩu | **Yes** <br>`PUT /api/auth/change-password` | **Yes** <br>Route `/account` | 1. Vào `/account` -> Tab Đổi mật khẩu. <br>2. Nhập mật khẩu cũ, mật khẩu mới, xác nhận lại mật khẩu mới. <br>3. Bấm "Cập nhật". | Yêu cầu kiểm tra độ mạnh của mật khẩu mới và mật khẩu cũ phải chính xác. |
| **UC03b** | Quên mật khẩu | **Yes** <br>`POST /api/auth/forgot-password` | **Yes** <br>Route `/forgot-password` | 1. Truy cập `/forgot-password`. <br>2. Nhập email tài khoản. <br>3. Bấm "Gửi mã OTP khôi phục". | **Đã sửa:** Hệ thống gửi mã OTP 6 số về email và hiển thị màn hình hướng dẫn kèm nút chuyển sang trang nhập OTP. |
| **UC03c** | Đặt lại mật khẩu | **Yes** <br>`POST /api/auth/reset-password` | **Yes** <br>Route `/reset-password` | 1. Đến `/reset-password?email={email}` hoặc truy cập trực tiếp. <br>2. Nhập Email, mã OTP 6 số và Mật khẩu mới. <br>3. Nhấn "Đặt lại mật khẩu". | **Đã sửa:** Đặt lại mật khẩu thành công bằng cách truyền đầy đủ `{ email, otp, newPassword }` khớp DTO của Backend. |
| **UC04** | Quản lý tài khoản nhân viên | **Yes** <br>`GET/POST/PUT/DELETE /api/admin/staff` | **Yes** <br>Route `/admin/staff` | 1. Đăng nhập quyền Admin. <br>2. Vào `/admin/staff`. <br>3. Thực hiện Thêm/Sửa/Xóa tài khoản nhân viên, phân vai trò và gán chi nhánh. | Hệ thống kiểm tra điều kiện phân quyền chi tiết (RBAC). |

---

### 2. Phân hệ Menu & Sản phẩm (Menu & Products)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC05** | Quản lý menu gốc | **Yes** <br>AdminMenu endpoints | **Yes** <br>Route `/admin/menu/items` | 1. Đăng nhập Admin. <br>2. Vào `/admin/menu/items`. <br>3. Kiểm tra danh sách hiển thị các món ăn/đồ uống của toàn hệ thống. | Hỗ trợ phân trang, tìm kiếm sản phẩm và bộ lọc. |
| **UC05a** | Tạo menu item | **Yes** <br>`POST /api/admin/menu-items` | **Yes** <br>Route `/admin/menu/items/new` | 1. Click "Thêm sản phẩm mới" ở trang menu gốc. <br>2. Nhập tên, danh mục, giá cơ bản, các lựa chọn Size (S/M/L), và các Toppings đi kèm. <br>3. Nhấn "Tạo". | Hỗ trợ tải ảnh lên Supabase Storage trực tiếp qua API. |
| **UC05b** | Cập nhật menu item | **Yes** <br>`PUT /api/admin/menu-items/{id}` | **Yes** <br>Route `/admin/menu/items/:id/edit` | 1. Chọn 1 sản phẩm -> Click "Sửa". <br>2. Thay đổi giá, size, hoặc tùy chọn. <br>3. Lưu thay đổi. | Hệ thống tự động xóa cache Redis liên quan để cập nhật ngay lập tức phía Client. |
| **UC05c** | Xoá menu item | **Yes** <br>`DELETE /api/admin/menu-items/{id}` | **Yes** <br>Nút "Xóa" trên bảng | 1. Tìm sản phẩm -> Click icon "Xóa". <br>2. Xác nhận hộp thoại xóa. | Áp dụng Soft Delete (`is_deleted = true`). Sản phẩm ẩn đi nhưng dữ liệu vẫn tồn tại trong database. |
| **UC06** | Quản lý menu chi nhánh | **Yes** <br>`PUT /api/branches/{id}/menu` | **Yes** <br>Route `/admin/menu/branch` | 1. Đăng nhập Admin hoặc Branch Manager. <br>2. Vào `/admin/menu/branch`. <br>3. Bật/tắt trạng thái món ở chi nhánh đó, hoặc điều chỉnh giá bán riêng biệt. | Quyền hạn được kiểm soát theo `users.branch_id` để tránh can thiệp chéo giữa các chi nhánh. |
| **UC07** | Xem menu | **Yes** <br>`GET /api/menu` | **Yes** <br>Route `/menu` | 1. Truy cập `/menu` với vai trò Guest/Customer. <br>2. Chọn chi nhánh ở Header. <br>3. Xem danh sách sản phẩm và giá cả tương ứng. | Menu sẽ áp dụng giá riêng của chi nhánh đó nếu có, và hiển thị trạng thái "Hết hàng tại chi nhánh" nếu món bị tắt. |
| **UC07a** | Xem menu dạng cây | **Yes** <br>`GET /api/menu/tree` | **Yes** <br>Menu phân loại ở trang shop | 1. Vào `/menu` hoặc `/merchandise`. <br>2. Bấm vào các thẻ danh mục bên trái để duyệt nhanh theo danh mục. | Menu trả về dạng cấu trúc lồng nhau từ Danh mục lớn -> Danh mục con -> Danh sách sản phẩm. |
| **UC07b** | Xem chi tiết món | **Yes** <br>`GET /api/menu/{id}` | **Yes** <br>Modal chi tiết món hoặc `/menu/:id` | 1. Tại trang menu, click vào sản phẩm bất kỳ. <br>2. Tùy chỉnh các options (Size S/M/L, Lượng đường/đá, Toppings đi kèm). | Cho phép tăng/giảm số lượng và xem sự thay đổi về tổng tiền của món trước khi thêm vào giỏ. |

---

### 3. Phân hệ Đặt hàng Online (Online Orders)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC08** | Đặt đồ uống (Pick-up) | **Yes** <br>`POST /api/orders/drink` | **Yes** <br>Trang `/cart` & `/menu` | 1. Chọn phương thức "Tự đến lấy" -> Chọn chi nhánh. <br>2. Thêm đồ uống vào giỏ hàng. <br>3. Điền tên + SĐT liên lạc. <br>4. Tiến hành thanh toán. | Đơn hàng tạo ra có loại là `ONLINE_PICKUP`. |
| **UC09** | Đặt đồ uống (Delivery) | **Yes** <br>`POST /api/orders/drink` | **Yes** <br>Trang `/cart` & `/menu` | 1. Chọn phương thức "Giao hàng". <br>2. Nhập địa chỉ giao. <br>3. Thêm đồ uống vào giỏ. <br>4. Chọn phương thức thanh toán. <br>5. Bấm Đặt hàng. | Đơn hàng tạo ra có loại là `ONLINE_COD` hoặc `ONLINE_TRANSFER` tùy vào hình thức thanh toán. |
| **UC10** | Mua Merchandise | **Yes** <br>`POST /api/orders/merchandise` | **Yes** <br>Route `/merchandise` & `/cart` | 1. Vào `/merchandise`. <br>2. Thêm các sản phẩm quà tặng vào giỏ. <br>3. Điền địa chỉ giao hàng và tiến hành checkout. | Đơn hàng tạo ra có loại là `MERCHANDISE`. Các món này không đi kèm tùy chỉnh đá/đường/size. |
| **UC11** | Thanh toán gộp | **Yes** <br>`POST /api/orders/checkout` | **Yes** <br>Quy trình checkout `/cart` | 1. Thêm đồng thời cả đồ uống (chọn chi nhánh/địa chỉ giao) và merchandise vào giỏ hàng. <br>2. Bấm "Thanh toán". <br>3. Click đặt hàng. | **MOCK Payment:** Hệ thống tự động tạo ra 2 đơn hàng riêng biệt trong CSDL nhưng gộp chung 1 giao dịch thanh toán thành công tức thì. |
| **UC12** | Theo dõi trạng thái đơn | **Yes** <br>`GET /api/orders` | **Yes** <br>Tab Order trong `/account` | 1. Đăng nhập tài khoản -> Vào trang `/account`. <br>2. Nhấp vào tab Đơn hàng để xem trạng thái đơn đồ uống và merchandise. | Trạng thái hiển thị cập nhật thời gian thực (Tiếp nhận -> Đang pha -> Sẵn sàng/Đang giao -> Hoàn thành). |
| **UC13** | Huỷ đơn | **Yes** <br>`DELETE /api/orders/{id}` | **Yes** <br>Nút "Hủy đơn" trong `/account` | 1. Tìm đơn hàng có trạng thái `PENDING` hoặc `CONFIRMED`. <br>2. Nhấp vào nút "Hủy đơn". <br>3. Xác nhận lý do. | Điểm tích lũy và tiền đã thanh toán (nếu có) sẽ được tự động hoàn lại cho khách hàng. |

---

### 4. Phân hệ POS tại quầy (POS at Counter)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC14** | Tạo đơn POS | **Yes** <br>`POST /api/pos/orders` | **Yes** <br>Route `/admin/orders/pos` | 1. Đăng nhập vai trò Cashier. <br>2. Truy cập `/admin/orders/pos`. <br>3. Chọn các danh mục và click sản phẩm, tùy chỉnh đá/đường/size để đưa vào giỏ. | Hỗ trợ lọc món nhanh và tìm kiếm sản phẩm tại quầy. |
| **UC15** | Áp dụng KM/điểm tại POS | **Yes** <br>Promotion & Loyalty APIs | **Yes** <br>Khung Khách hàng ở POS | 1. Tìm kiếm thông tin khách hàng bằng SĐT tại POS. <br>2. Áp dụng điểm tích lũy hoặc mã voucher của khách hàng vào đơn hàng. | Hệ thống tự tính toán lại số tiền giảm trừ ngay trên giao diện POS. |
| **UC16** | Thanh toán tại quầy | **Yes** <br>`POST /api/pos/payment` | **Yes** <br>Popup Thanh toán ở POS | 1. Click "Thanh toán" tại POS. <br>2. Chọn Tiền mặt (nhập tiền khách đưa để tính tiền thừa) hoặc quét QR. <br>3. Xác nhận hoàn tất thanh toán. | Đơn hàng tạo ra sẽ được chuyển ngay vào hàng đợi pha chế của chi nhánh. |
| **UC17** | Xem hàng đợi pha chế | **Yes** <br>`GET /api/pos/queue` | **Yes** <br>Route `/admin/orders/queue` | 1. Đăng nhập Barista hoặc Cashier. <br>2. Vào `/admin/orders/queue`. <br>3. Xem danh sách các món cần thực hiện (bao gồm cả đơn online pick-up và đơn tại quầy). | Các đơn được hiển thị trực quan theo thứ tự thời gian đặt hàng. |
| **UC18** | Cập nhật trạng thái pha chế | **Yes** <br>`PUT /api/pos/orders/{id}/brewing-status` | **Yes** <br>Nút trạng thái ở Queue | 1. Bấm nút "Bắt đầu pha" -> Đơn chuyển sang `BREWING`. <br>2. Bấm nút "Hoàn thành" -> Đơn chuyển sang `READY`/`COMPLETED`. | Khi hoàn thành, hệ thống tự động trừ nguyên liệu trong kho chi nhánh và tích điểm loyalty cho khách hàng. |

---

### 5. Phân hệ Quản lý Chi nhánh & Kho nguyên liệu (Branch & Stock)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC19** | Quản lý chi nhánh | **Yes** <br>AdminBranch endpoints | **Yes** <br>Route `/admin/branches` | 1. Đăng nhập Admin. <br>2. Vào `/admin/branches`. <br>3. Thực hiện Thêm mới hoặc Cập nhật thông tin chi nhánh (Tên, địa chỉ, giờ hoạt động, Tọa độ Lat/Lng). | Lat/Lng cần chính xác để hệ thống tính toán khoảng cách phục vụ gợi ý chi nhánh giao hàng. |
| **UC20** | Quản lý nguyên liệu & công thức | **Yes** <br>Ingredient & Recipe endpoints | **Yes** <br>Route `/admin/ingredients` & `/admin/ingredients/recipes` | 1. Vào `/admin/ingredients` để quản lý danh mục nguyên liệu. <br>2. Vào `/admin/ingredients/recipes` để cài đặt định lượng nguyên liệu cho từng kích cỡ của mỗi món. | Cho phép gán định lượng nguyên liệu chi tiết (ml, gram, cái) theo từng Size đồ uống. |
| **UC21** | Quản lý kho nguyên liệu chi nhánh | **Yes** <br>`GET/POST /api/branch/stock` | **Yes** <br>Route `/admin/stock` & `/admin/stock/import` | 1. Đăng nhập Branch Manager. <br>2. Vào `/admin/stock` để xem mức tồn kho hiện tại. <br>3. Vào `/admin/stock/import` để tạo phiếu nhập nguyên liệu từ nhà cung cấp. | Hiển thị cảnh báo đỏ khi mức tồn kho xuống dưới ngưỡng an toàn cấu hình trong hệ thống. |
| **UC22** | Trừ nguyên liệu tự động | **Yes** <br>(Tác vụ nền tự động) | **No** (Hiển thị qua số lượng tồn kho) | 1. Thực hiện pha chế hoàn thành đơn hàng đồ uống. <br>2. Kiểm tra lại mức tồn kho ở `/admin/stock` của chi nhánh đó. | Khi đơn hàng hoàn thành, hệ thống tự động tính toán tổng định lượng nguyên liệu dựa trên công thức cấu hình và trừ vào kho. |
| **UC23** | Quản lý nhà cung cấp | **Yes** <br>Supplier endpoints | **Yes** <br>Route `/admin/suppliers` | 1. Đăng nhập Admin hoặc Branch Manager. <br>2. Vào `/admin/suppliers` để quản lý thông tin nhà cung cấp nguyên liệu và lịch sử nhập hàng. | Hỗ trợ lưu trữ thông tin liên hệ và theo dõi công nợ, giao dịch nhập hàng. |

---

### 6. Phân hệ Loyalty & Khuyến mãi (Loyalty & Promotions)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC24** | Tích điểm | **Yes** <br>(Tác vụ nền tự động) | **Yes** <br>Trang cá nhân `/account` | 1. Đặt đơn hàng thành công. <br>2. Chờ đơn hàng hoàn thành. <br>3. Kiểm tra mục Loyalty trong `/account` để xem số điểm được cộng thêm. | Tỷ lệ tích điểm dựa trên hạng thành viên của tài khoản (Bronze, Silver, Gold, Platinum). |
| **UC25** | Đổi điểm lấy quà/giảm giá | **Yes** <br>`POST /api/loyalty/redeem` | **Yes** <br>Khung Loyalty ở Checkout | 1. Tại bước Checkout đơn hàng ở `/cart`. <br>2. Tick vào ô sử dụng điểm tích lũy. <br>3. Xem số tiền giảm tương ứng (1 điểm = 1.000đ). | Điểm sẽ được khấu trừ trực tiếp vào tổng tiền thanh toán của hóa đơn. |
| **UC26** | Quản lý hạng thành viên | **Yes** <br>MembershipTier endpoints | **Yes** <br>Route `/admin/loyalty/tiers` | 1. Đăng nhập Admin. <br>2. Vào `/admin/loyalty/tiers`. <br>3. Cấu hình mức điểm tích lũy tối thiểu để lên hạng và hệ số nhân tích điểm tương ứng. | Cập nhật hạng thành viên tự động khi người dùng đạt đủ tổng chi tiêu yêu cầu. |
| **UC27** | Quản lý khuyến mãi | **Yes** <br>AdminPromotion endpoints | **Yes** <br>Route `/admin/promotions` | 1. Vào `/admin/promotions`. <br>2. Click thêm mới chương trình khuyến mãi (giảm %, giảm tiền, thiết lập Happy Hour, chọn chi nhánh áp dụng). | Hệ thống hỗ trợ cấu hình điều kiện đơn hàng tối thiểu và giới hạn số lượt áp dụng. |
| **UC28** | Quản lý voucher | **Yes** <br>AdminVoucher endpoints | **Yes** <br>Route `/admin/vouchers` | 1. Đăng nhập Admin. <br>2. Vào `/admin/vouchers` để phát hành mã voucher (cố định hoặc sinh lô tự động) và phân bổ cho khách hàng. | Trạng thái voucher được quản lý chi tiết gồm: AVAILABLE, USED, EXPIRED. |
| **UC29** | Áp dụng voucher/KM | **Yes** <br>`POST /api/promotions/calculate` | **Yes** <br>Khung nhập Voucher ở Checkout | 1. Tại Checkout đơn hàng, nhập mã voucher vào ô "Mã giảm giá". <br>2. Nhấp nút "Áp dụng". <br>3. Xem số tiền giảm và tổng tiền thanh toán mới. | Hệ thống tự tính toán mức giảm phù hợp nhất dựa trên scope áp dụng (Đơn hàng, Danh mục hoặc Sản phẩm). |

---

### 7. Phân hệ Báo cáo & Thống kê (Reports & Statistics)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC30** | Báo cáo doanh thu | **Yes** <br>`GET /api/reports/revenue` | **Yes** <br>Route `/admin/reports/revenue` | 1. Đăng nhập Admin hoặc Branch Manager. <br>2. Vào `/admin/reports/revenue`. <br>3. Chọn chu kỳ báo cáo (ngày, tuần, tháng, năm) để xem biểu đồ đường doanh thu. | Admin có quyền xem doanh thu toàn chuỗi và so sánh; Branch Manager chỉ được xem số liệu của chi nhánh mình. |
| **UC31** | Báo cáo món bán chạy | **Yes** <br>`GET /api/reports/top-products` | **Yes** <br>Route `/admin/reports/products` | 1. Đăng nhập Admin hoặc Branch Manager. <br>2. Vào `/admin/reports/products` để xem biểu đồ cột danh sách sản phẩm bán chạy nhất. | Thống kê chi tiết theo cả doanh số thu về và số lượng sản phẩm bán ra thực tế. |
| **UC32** | Báo cáo tồn kho nguyên liệu | **Yes** <br>`GET /api/reports/inventory` | **Yes** <br>Route `/admin/reports/inventory` | 1. Vào `/admin/reports/inventory` để xem lượng xuất/nhập/tồn và tốc độ tiêu hao của từng loại nguyên liệu. | Hỗ trợ xuất báo cáo định dạng Excel và CSV. |
| **UC33** | Báo cáo loyalty | **Yes** <br>`GET /api/reports/loyalty-stats` | **Yes** <br>Route `/admin/reports/loyalty` | 1. Đăng nhập Admin. <br>2. Vào `/admin/reports/loyalty` để xem biểu đồ thống kê phân bố hạng thành viên và lượng điểm tích/tiêu. | Giúp theo dõi và đánh giá hiệu quả giữ chân khách hàng của hệ thống loyalty. |
| **UC34** | Nhật ký hệ thống | **Yes** <br>`GET /api/admin/audit-logs` | **Yes** <br>Route `/admin/settings/audit-log` | 1. Đăng nhập Admin. <br>2. Vào `/admin/settings/audit-log`. <br>3. Kiểm tra danh sách lưu vết các hành động quản trị (Thêm/Sửa/Xóa). | Ghi lại chính xác Account thực hiện, thời gian, loại thao tác và chi tiết thay đổi để phục vụ kiểm toán an toàn. |

---

### 8. Phân hệ Thông tin thương hiệu & Cấu hình (Brand & Config)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC35** | Xem thông tin thương hiệu | **No** (Không cần thiết) | **Yes** <br>Routes `/about`, `/mission`, `/contact` | 1. Click các liên kết (Về chúng tôi, Sứ mệnh, Liên hệ, Hệ thống chi nhánh) ở chân trang (Footer). | Nội dung được hardcode trực tiếp dưới client, không yêu cầu gọi API từ Backend. |
| **UC36** | Cấu hình hệ thống | **Yes** <br>AdminSystemConfig | **Yes** <br>Route `/admin/settings` | 1. Đăng nhập Admin. <br>2. Vào `/admin/settings`. <br>3. Thay đổi các cấu hình hệ thống (Phí giao hàng theo km, ngưỡng tồn kho an toàn mặc định). | Dữ liệu được lưu trong bảng cấu hình hệ thống ở DB PostgreSQL và áp dụng tức thì cho logic Backend. |

---

### 9. Phân hệ Trí tuệ Nhân tạo (AI & Data)

| Mã UC | Tên Use Case | Trạng thái BE | Trạng thái FE | Hướng dẫn kiểm thử trên FE (Test Flow) | Kết quả rà soát / Lưu ý QA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC37** | Dự báo nhu cầu nguyên liệu | **Yes** <br>`GET /api/ai/forecast` | **Yes** <br>Route `/admin/ai/forecast` | 1. Đăng nhập Admin hoặc Branch Manager. <br>2. Vào `/admin/ai/forecast`. <br>3. Xem biểu đồ dự báo nhu cầu tiêu thụ nguyên liệu trong 7 ngày tới. | Thuật toán Holt-Winters tự động tính toán dựa trên dữ liệu bán hàng lịch sử trong CSDL. |
| **UC38** | Xem phân khúc khách hàng (RFM) | **Yes** <br>`GET /api/ai/segments` | **Yes** <br>Route `/admin/loyalty/customers/segments` | 1. Đăng nhập Admin. <br>2. Vào `/admin/loyalty/customers/segments` để xem biểu đồ phân nhóm khách hàng (VIP, Churn Risk, Loyal,...). | Phân nhóm tự động theo các chỉ số Recency (Độ mới), Frequency (Tần suất), và Monetary (Chi tiêu). |
| **UC39** | Gợi ý chi nhánh tối ưu | **Yes** <br>`GET /api/ai/branch-suggest` | **Yes** <br>Quy trình Checkout | 1. Đặt đồ uống giao tận nơi (Delivery). <br>2. Nhập địa chỉ nhận hàng. <br>3. Hệ thống sẽ tự động đề xuất chi nhánh giao hàng tối ưu nhất. | Sử dụng công thức toán học Haversine tính khoảng cách kết hợp với số lượng đơn đang pha chế tại quầy (Queue Load) ở từng chi nhánh. |
| **UC40** | Gợi ý món Upsell | **Yes** <br>`GET /api/ai/upsell` | **Yes** <br>Popup thêm món | 1. Mở trang menu, bấm nút "Thêm vào giỏ" đối với một sản phẩm bất kỳ. <br>2. Xem danh sách gợi ý các món mua kèm trên popup vừa hiển thị. | Áp dụng thuật toán Association Rules (luật kết hợp Apriori) trên dữ liệu các hóa đơn lịch sử chuỗi. |

---
*Báo cáo được tổng hợp bởi AI Coding Assistant Antigravity.*
