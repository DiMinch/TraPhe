# TraPhe - Coffee & Tea Chain Management System

TraPhe là hệ thống quản lý chuỗi cửa hàng cà phê & trà được thiết kế theo mô hình vận hành hiện đại tương tự chuỗi Phúc Long. Hệ thống tích hợp toàn diện từ bán hàng trực tuyến (Customer Web), vận hành trực tiếp tại quầy (POS & Hàng đợi pha chế) đến quản lý kho nguyên vật liệu, định lượng công thức, loyalty tích điểm phân hạng, báo cáo và gợi ý thông minh từ AI.

---

## 🚀 Điểm Sáng Kỹ Thuật (Architecture & Advanced Techniques)

Hệ thống được phát triển với trọng tâm giải quyết các bài toán hiệu năng và nghiệp vụ F&B thực tế bằng các mẫu thiết kế và kỹ thuật lập trình nâng cao:

* **Strategy Design Pattern (Phân hệ Thanh toán):** Tự động điều phối các cổng thanh toán (VNPay, MoMo, Tiền mặt, QR code) độc lập thông qua Spring IoC Injection động, đảm bảo tính mở rộng dễ dàng (nguyên lý Open/Closed).
* **Stateless JWT + Redis Token Blacklist:** Đảm bảo an toàn đăng xuất (Stateless Logout) bằng cách băm SHA-256 các token bị hủy và lưu vào Redis Cache với thời gian sống (TTL) tự động giải phóng bộ nhớ.
* **Java 21 Virtual Threads (Loyalty Engine):** Chạy bất đồng bộ các luồng ghi nhận điểm và xét hạng thành viên I/O-bound thông qua Virtual Threads Adapter, không làm nghẽn luồng xử lý giao dịch chính.
* **JPA N+1 Query Fix (Order & Reports):** Sử dụng `@EntityGraph` (JOIN FETCH) trên JPA repository giúp tối ưu hóa từ N+1 câu lệnh SELECT thành 1 câu SQL gộp (`LEFT OUTER JOIN`), giảm tải tối đa cho PostgreSQL.
* **Parallel Streams (AI Forecasting & Association Rules):** Xử lý song song CPU-bound cho tiến trình khai phá luật kết hợp Apriori gợi ý món mua kèm (Upsell) dựa trên `ForkJoinPool` đa nhân.
* **Docker Containerization (Resource Capping):** Cấu hình giới hạn cứng tài nguyên (RAM 768MB, JVM Arguments phân bổ hợp lý) giúp chạy ổn định đồng thời cả chuỗi Services chỉ với 1 lệnh `docker-compose`.

---

## 📁 Cấu Trúc Dự Án

```bash
TraPhe/
├── traphe-frontend/     # Mã nguồn React UI (Vite + TypeScript + TailwindCSS)
├── traphe-backend/      # Mã nguồn Spring Boot RESTful API (Java 21)
├── docker-compose.yml   # Cấu hình containerization dev environment
├── seed_data.sql        # Dữ liệu mẫu cơ bản (Categories, Menu gốc)
└── seed_advanced_data.sql  # Dữ liệu mô phỏng nâng cao (Lịch sử đơn hàng, kho bãi)
```

---

## ⚙️ Hướng Dẫn Cài Đặt và Chạy Dự Án

### Yêu cầu hệ thống:
* **Node.js** >= 18
* **Java SDK** 21
* **Maven** >= 3.8
* **Docker** & **Docker Compose** (Khuyến khích dùng để cài đặt nhanh nhất)

---

### Cách 1: Chạy nhanh bằng Docker (Khuyến khích)

Docker Compose sẽ tự động khởi tạo môi trường bao gồm: Cơ sở dữ liệu bộ nhớ đệm **Redis**, Spring Boot **Backend**, và React **Frontend** có sẵn cơ chế đồng bộ nóng mã nguồn (Hot-Reload) trên Windows/WSL2.

1. Khởi động môi trường chứa toàn bộ dịch vụ:
   ```bash
   docker-compose up -d
   ```
2. Kiểm tra trạng thái các container đang chạy:
   ```bash
   docker ps
   ```
3. Truy cập vào các cổng hệ thống:
   * **Frontend:** `http://localhost:5173`
   * **Backend API:** `http://localhost:8080`
   * **Redis Server:** `localhost:6379` (không mật khẩu)
4. Dừng tất cả container:
   ```bash
   docker-compose down
   ```

---

### Cách 2: Khởi chạy thủ công từng phần (Manual Setup)

#### 1. Thiết lập Backend (`traphe-backend`)
1. Đảm bảo bạn đang cài đặt và chạy **Redis Server** trên máy cục bộ ở cổng `6379`.
2. Tạo mới một cơ sở dữ liệu PostgreSQL (hoặc dùng dịch vụ cloud Supabase).
3. Đổi tên file cấu hình hoặc chỉnh sửa cấu hình kết nối DB trong `src/main/resources/application.yml` (hoặc cấu hình các biến môi trường tương ứng):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/traphe_db
       username: <your_username>
       password: <your_password>
     data:
       redis:
         host: localhost
         port: 6379
   ```
4. Cài đặt các thư viện và khởi chạy Backend:
   ```bash
   cd traphe-backend
   ./mvnw clean spring-boot:run
   ```
   * *Backend API sẽ lắng nghe tại cổng `8080`.*

#### 2. Thiết lập Frontend (`traphe-frontend`)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd traphe-frontend
   ```
2. Tạo file `.env` tại thư mục gốc của frontend để trỏ API endpoint:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
3. Cài đặt các thư viện Node modules:
   ```bash
   npm install
   ```
4. Khởi động môi trường lập trình local:
   ```bash
   npm run dev
   ```
   * *Màn hình giao diện sẽ chạy tại địa chỉ `http://localhost:5173`.*

---

## 🗄️ Khởi Tạo Dữ Liệu Cơ Sở Dữ Liệu (Database Seeding)

Dự án cung cấp hai tập lệnh SQL để nạp dữ liệu chạy thử giúp các biểu đồ báo cáo và các thuật toán gợi ý AI hoạt động trực quan nhất:

1. **`seed_data.sql`:** Khởi tạo danh mục món gốc, 3 chi nhánh và các vai trò nhân viên mặc định.
2. **`seed_advanced_data.sql`:** Chạy tập lệnh PL/pgSQL mô phỏng tự động sinh ra:
   * Công thức định lượng chi tiết cho toàn bộ các size đồ uống chính.
   * Lượng tồn kho dồi dào cho 27 loại nguyên liệu tại tất cả 5 chi nhánh (135 bản ghi).
   * **65 đơn hàng lịch sử thực tế** trải đều trong 30 ngày qua (với đầy đủ dữ liệu khách mua, topping, thanh toán MoMo/VNPAY/tiền mặt, lịch sử tích và đổi điểm loyalty nâng hạng thành viên).

*Cách thực thi:* Chạy trực tiếp các file SQL này lên Client quản lý DB của bạn (như pgAdmin, DBeaver, hoặc SQL Editor trên Supabase).


