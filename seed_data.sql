-- ============================================================
-- TRAPHE SEED DATA: Nhà cung cấp, Nguyên liệu, Nhập kho
-- Branches: Q1=6c4d229d, Q3=fc0317a1, Thủ Đức=d0c31e90, Central=2f9bb7bc
-- Run: psql <connection_string> -f seed_data.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. NHÀ CUNG CẤP (suppliers)
-- ============================================================
INSERT INTO suppliers (id, name, contact_name, phone, email, address, created_at, updated_at, is_deleted)
VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Cà Phê Trung Nguyên Legend', 'Nguyễn Văn Hùng', '0901234501', 'supply@trungnguyen.com.vn', '82 Bùi Thị Xuân, Phường 1, Quận Tân Bình, TP.HCM', NOW(), NOW(), false),
  ('a1000001-0000-0000-0000-000000000002', 'Sữa Vinamilk - Phân phối HCM', 'Trần Thị Lan', '0901234502', 'b2b@vinamilk.com.vn', '184 Nguyễn Đình Chiểu, Quận 3, TP.HCM', NOW(), NOW(), false),
  ('a1000001-0000-0000-0000-000000000003', 'Công ty TNHH Trà Thái Nguyên Sạch', 'Phạm Minh Đức', '0901234503', 'contact@trathainguyen.vn', '45 Lê Lợi, TP. Thái Nguyên, Thái Nguyên', NOW(), NOW(), false),
  ('a1000001-0000-0000-0000-000000000004', 'Đường Biên Hòa - Chi nhánh HCM', 'Lê Thị Hoa', '0901234504', 'sale@bienhoasugar.vn', '56 Nguyễn Tất Thành, Quận 4, TP.HCM', NOW(), NOW(), false),
  ('a1000001-0000-0000-0000-000000000005', 'Công ty TNHH Topping Việt', 'Đinh Quang Nam', '0901234505', 'order@toppingviet.vn', '120 Cộng Hòa, Quận Tân Bình, TP.HCM', NOW(), NOW(), false),
  ('a1000001-0000-0000-0000-000000000006', 'Syrup Monin Việt Nam', 'Vũ Thị Thu', '0901234506', 'vn@monin.com', '12 Hoàng Diệu 2, TP. Thủ Đức, TP.HCM', NOW(), NOW(), false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. NGUYÊN LIỆU (ingredients)
-- ============================================================
INSERT INTO ingredients (id, name, unit, min_stock_alert, is_active, is_deleted, created_at, updated_at)
VALUES
  -- Cà phê
  ('b2000001-0000-0000-0000-000000000001', 'Cà phê Arabica (hạt rang)', 'gram', 2000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000002', 'Cà phê Robusta (hạt rang)', 'gram', 2000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000003', 'Cà phê espresso (pha sẵn)', 'ml', 1000, true, false, NOW(), NOW()),

  -- Sữa & kem
  ('b2000001-0000-0000-0000-000000000004', 'Sữa tươi không đường Vinamilk', 'ml', 5000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000005', 'Sữa đặc có đường', 'ml', 2000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000006', 'Kem tươi (whipping cream)', 'ml', 1000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000007', 'Sữa oat (yến mạch)', 'ml', 2000, true, false, NOW(), NOW()),

  -- Trà
  ('b2000001-0000-0000-0000-000000000008', 'Trà xanh Thái Nguyên', 'gram', 1000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000009', 'Trà oolong cao cấp', 'gram', 500, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000010', 'Trà đen Ceylon', 'gram', 500, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000011', 'Bột matcha Nhật Bản', 'gram', 300, true, false, NOW(), NOW()),

  -- Đường & syrup
  ('b2000001-0000-0000-0000-000000000012', 'Đường trắng tinh luyện', 'gram', 3000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000013', 'Đường nâu (brown sugar)', 'gram', 1000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000014', 'Syrup vani Monin', 'ml', 500, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000015', 'Syrup caramel Monin', 'ml', 500, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000016', 'Syrup dâu tây Monin', 'ml', 300, true, false, NOW(), NOW()),

  -- Topping
  ('b2000001-0000-0000-0000-000000000017', 'Trân châu đen (tapioca)', 'gram', 2000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000018', 'Trân châu trắng', 'gram', 1000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000019', 'Thạch dừa', 'gram', 1000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000020', 'Thạch cà phê', 'gram', 500, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000021', 'Pudding trứng', 'cái', 100, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000022', 'Phô mai cream cheese', 'gram', 500, true, false, NOW(), NOW()),

  -- Khác
  ('b2000001-0000-0000-0000-000000000023', 'Nước lọc tinh khiết', 'ml', 10000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000024', 'Đá viên', 'gram', 5000, true, false, NOW(), NOW()),
  ('b2000001-0000-0000-0000-000000000025', 'Bột trà sữa hòa tan', 'gram', 1000, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Cập nhật "Bột trà sữa" đã có sẵn (ID: 56b83e80...)
UPDATE ingredients SET min_stock_alert = 1000, is_active = true WHERE id = '56b83e80-a741-4869-97f3-8d98d255e1b3';

-- ============================================================
-- 3. ĐƠN NHẬP KHO (purchase_orders + purchase_order_items)
-- Đơn RECEIVED (đã nhận): cập nhật tồn kho luôn qua ingredient_stock
-- ============================================================

-- === PO #1: Nhập cà phê từ Trung Nguyên — đã nhận (RECEIVED) ===
INSERT INTO purchase_orders (id, po_number, supplier_id, branch_id, status, total_amount, expected_delivery_date, actual_delivery_date, note, created_at, updated_at, created_by, updated_by, is_deleted)
VALUES (
  'c3000001-0000-0000-0000-000000000001',
  'PO-2025-001',
  'a1000001-0000-0000-0000-000000000001',
  '6c4d229d-c21b-41e9-b44b-9a6dbeefb757',
  'RECEIVED',
  4850000,
  '2025-05-10',
  '2025-05-12',
  'Nhập cà phê định kỳ tháng 5',
  NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days',
  NULL, NULL, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity_ordered, quantity_received, unit_price)
VALUES
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000001', 5000, 5000, 650),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000002', 3000, 3000, 450);

-- === PO #2: Nhập sữa từ Vinamilk — đã nhận (RECEIVED) ===
INSERT INTO purchase_orders (id, po_number, supplier_id, branch_id, status, total_amount, expected_delivery_date, actual_delivery_date, note, created_at, updated_at, created_by, updated_by, is_deleted)
VALUES (
  'c3000001-0000-0000-0000-000000000002',
  'PO-2025-002',
  'a1000001-0000-0000-0000-000000000002',
  '6c4d229d-c21b-41e9-b44b-9a6dbeefb757',
  'RECEIVED',
  3750000,
  '2025-05-12',
  '2025-05-13',
  'Sữa tươi tuần 2 tháng 5',
  NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days',
  NULL, NULL, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity_ordered, quantity_received, unit_price)
VALUES
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000004', 20000, 20000, 120),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000006', 5000, 5000, 270);

-- === PO #3: Nhập trà cho Q3 — đã nhận (RECEIVED) ===
INSERT INTO purchase_orders (id, po_number, supplier_id, branch_id, status, total_amount, expected_delivery_date, actual_delivery_date, note, created_at, updated_at, created_by, updated_by, is_deleted)
VALUES (
  'c3000001-0000-0000-0000-000000000003',
  'PO-2025-003',
  'a1000001-0000-0000-0000-000000000003',
  'fc0317a1-fb35-4282-a97f-8eecc2eba4e2',
  'RECEIVED',
  5200000,
  '2025-05-15',
  '2025-05-16',
  'Trà Thái Nguyên + matcha tháng 5',
  NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days',
  NULL, NULL, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity_ordered, quantity_received, unit_price)
VALUES
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000008', 3000, 3000, 850),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000009', 1000, 1000, 1200),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000011', 500,  500,  1800);

-- === PO #4: Nhập topping — đã nhận (RECEIVED) ===
INSERT INTO purchase_orders (id, po_number, supplier_id, branch_id, status, total_amount, expected_delivery_date, actual_delivery_date, note, created_at, updated_at, created_by, updated_by, is_deleted)
VALUES (
  'c3000001-0000-0000-0000-000000000004',
  'PO-2025-004',
  'a1000001-0000-0000-0000-000000000005',
  '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1',
  'RECEIVED',
  2890000,
  '2025-05-18',
  '2025-05-18',
  'Topping định kỳ: trân châu, thạch dừa',
  NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days',
  NULL, NULL, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity_ordered, quantity_received, unit_price)
VALUES
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000017', 5000, 5000, 280),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000018', 2000, 2000, 310),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000019', 3000, 3000, 130);

-- === PO #5: Nhập syrup Monin — đang chờ nhận (DRAFT) ===
INSERT INTO purchase_orders (id, po_number, supplier_id, branch_id, status, total_amount, expected_delivery_date, actual_delivery_date, note, created_at, updated_at, created_by, updated_by, is_deleted)
VALUES (
  'c3000001-0000-0000-0000-000000000005',
  'PO-2025-005',
  'a1000001-0000-0000-0000-000000000006',
  '6c4d229d-c21b-41e9-b44b-9a6dbeefb757',
  'DRAFT',
  3600000,
  '2025-05-28',
  NULL,
  'Syrup Monin tháng 5 — chờ giao hàng',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
  NULL, NULL, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity_ordered, quantity_received, unit_price)
VALUES
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000014', 2000, 0, 850),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000015', 2000, 0, 850),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000016', 1000, 0, 950);

-- === PO #6: Nhập đường + sữa đặc — đã đóng (CLOSED) ===
INSERT INTO purchase_orders (id, po_number, supplier_id, branch_id, status, total_amount, expected_delivery_date, actual_delivery_date, note, created_at, updated_at, created_by, updated_by, is_deleted)
VALUES (
  'c3000001-0000-0000-0000-000000000006',
  'PO-2025-006',
  'a1000001-0000-0000-0000-000000000004',
  'fc0317a1-fb35-4282-a97f-8eecc2eba4e2',
  'CLOSED',
  1980000,
  '2025-05-05',
  '2025-05-06',
  'Đường + sữa đặc tháng 4 bổ sung',
  NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days',
  NULL, NULL, false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity_ordered, quantity_received, unit_price)
VALUES
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000012', 10000, 10000, 28),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000013', 3000,  3000, 85),
  (gen_random_uuid(), 'c3000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000005', 5000,  5000, 80);

-- ============================================================
-- 4. TỒN KHO CHI NHÁNH (ingredient_stock)
-- Seed cho Q1 (6c4d229d) và Q3 (fc0317a1)
-- ============================================================
INSERT INTO ingredient_stock (id, branch_id, ingredient_id, quantity_available, last_updated)
VALUES
  -- Q1
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000001', 4200, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000002', 2800, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000004', 18000, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000005', 4200, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000006', 3800, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000008', 1500, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000011', 380, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000012', 8500, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000014', 1200, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000017', 3500, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000019', 2100, NOW()),
  (gen_random_uuid(), '6c4d229d-c21b-41e9-b44b-9a6dbeefb757', 'b2000001-0000-0000-0000-000000000024', 15000, NOW()),
  -- Q3
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000001', 3100, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000002', 1900, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000004', 14000, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000008', 2400, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000009', 850, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000011', 450, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000012', 9200, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000017', 4200, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000005', 3100, NOW()),
  (gen_random_uuid(), 'fc0317a1-fb35-4282-a97f-8eecc2eba4e2', 'b2000001-0000-0000-0000-000000000024', 12000, NOW()),
  -- Central Square
  (gen_random_uuid(), '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1', 'b2000001-0000-0000-0000-000000000001', 2500, NOW()),
  (gen_random_uuid(), '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1', 'b2000001-0000-0000-0000-000000000004', 10000, NOW()),
  (gen_random_uuid(), '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1', 'b2000001-0000-0000-0000-000000000017', 2800, NOW()),
  (gen_random_uuid(), '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1', 'b2000001-0000-0000-0000-000000000019', 1500, NOW()),
  (gen_random_uuid(), '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1', 'b2000001-0000-0000-0000-000000000012', 6000, NOW()),
  (gen_random_uuid(), '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1', 'b2000001-0000-0000-0000-000000000024', 10000, NOW())
ON CONFLICT DO NOTHING;

COMMIT;

-- Kiểm tra kết quả
SELECT 'Nhà cung cấp' AS bang, COUNT(*) AS so_luong FROM suppliers WHERE is_deleted = false
UNION ALL
SELECT 'Nguyên liệu', COUNT(*) FROM ingredients WHERE is_deleted = false
UNION ALL
SELECT 'Đơn nhập kho', COUNT(*) FROM purchase_orders WHERE is_deleted = false
UNION ALL
SELECT 'Tồn kho (bản ghi)', COUNT(*) FROM ingredient_stock;
