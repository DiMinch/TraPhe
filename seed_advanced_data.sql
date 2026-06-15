-- ============================================================
-- TRAPHE SEED ADVANCED DATA: Tồn kho, Công thức, Đơn hàng Lịch sử
-- ============================================================

BEGIN;

-- ============================================================
-- 1. DỌN DẸP DỮ LIỆU ĐƠN HÀNG CŨ (Để tránh xung đột số đơn và dữ liệu rác)
-- ============================================================
TRUNCATE TABLE order_item_options CASCADE;
TRUNCATE TABLE order_item_toppings CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE loyalty_point_transactions CASCADE;
TRUNCATE TABLE payment_transactions CASCADE;
TRUNCATE TABLE promotion_usages CASCADE;
TRUNCATE TABLE combined_checkouts CASCADE;
-- Xóa orders cũ (chỉ xóa những dòng không bị ràng buộc bởi các bảng khác nếu có, nhưng TRUNCATE là sạch nhất)
TRUNCATE TABLE orders CASCADE;

-- Đặt lại điểm loyalty về 0 để tính toán lại từ đầu theo đơn hàng mới
UPDATE loyalty_points SET points_available = 0, total_spending = 0.00, updated_at = NOW();

-- ============================================================
-- 2. CẤP PHÁT TỒN KHO NGUYÊN LIỆU ĐẦY ĐỦ CHO CÁC CHI NHÁNH ĐANG HOẠT ĐỘNG
-- ============================================================
DO $$
DECLARE
  v_branch_id UUID;
  v_ing RECORD;
  v_active_branches UUID[] := ARRAY[
    '6c4d229d-c21b-41e9-b44b-9a6dbeefb757'::UUID, -- Quận 1
    '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1'::UUID, -- Central Square
    'fc0317a1-fb35-4282-a97f-8eecc2eba4e2'::UUID, -- Quận 3
    '5202c531-d005-41cd-94bb-026247baab11'::UUID, -- Cần Thơ
    'a4f16ae7-9cdf-4348-9954-40ba0436b0a3'::UUID  -- Vĩnh Long
  ];
BEGIN
  FOREACH v_branch_id IN ARRAY v_active_branches LOOP
    FOR v_ing IN (SELECT id, name FROM ingredients WHERE is_deleted = false) LOOP
      INSERT INTO ingredient_stock (id, branch_id, ingredient_id, quantity_available, last_updated, version)
      VALUES (
        gen_random_uuid(), 
        v_branch_id, 
        v_ing.id, 
        CASE 
          WHEN v_ing.name LIKE '%matcha%' THEN 2000.00 -- 2kg matcha
          WHEN v_ing.name LIKE '%Syrup%' THEN 5000.00 -- 5 liters syrup
          WHEN v_ing.name LIKE '%Sữa%' THEN 20000.00 -- 20 liters milk
          WHEN v_ing.name LIKE '%Cà phê%' THEN 10000.00 -- 10kg coffee
          WHEN v_ing.name LIKE '%Trà%' THEN 5000.00 -- 5kg tea
          ELSE 15000.00
        END, 
        NOW(), 
        0
      )
      ON CONFLICT (branch_id, ingredient_id) DO UPDATE
      SET quantity_available = EXCLUDED.quantity_available,
          last_updated = NOW();
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 3. CÔNG THỨC ĐỒ UỐNG (recipes & recipe_items)
-- ============================================================
-- Xóa các công thức cũ
DELETE FROM recipe_items;
DELETE FROM recipes;

-- Thêm công thức cho 6 món uống chính
INSERT INTO recipes (id, menu_item_id, size, is_active, is_deleted, created_at, updated_at, version)
VALUES
  ('d1000001-0000-0000-0000-000000000001', 'f7f46e67-6b4e-4eea-8637-b631ff9db128', NULL, true, false, NOW(), NOW(), 0), -- Trà Sữa Trà Đen
  ('d1000001-0000-0000-0000-000000000002', 'bfee298b-db3f-44fb-ac18-667968a58f04', NULL, true, false, NOW(), NOW(), 0), -- Trà Sữa Matcha
  ('d1000001-0000-0000-0000-000000000003', '38798b05-20bc-40f4-9fcb-92bbe05cb19b', NULL, true, false, NOW(), NOW(), 0), -- Trà Sữa Khoai Môn
  ('d1000001-0000-0000-0000-000000000004', 'd3dac23b-5d50-4915-a96a-0acf3c45b8b5', NULL, true, false, NOW(), NOW(), 0), -- Cà Phê Dừa
  ('d1000001-0000-0000-0000-000000000005', 'bb97f585-f6ce-45de-b3d1-3e66e19f3a7e', NULL, true, false, NOW(), NOW(), 0), -- Sinh Tố Xoài
  ('d1000001-0000-0000-0000-000000000006', '33c26e2a-e84c-412c-a5be-7fda3cc25944', NULL, true, false, NOW(), NOW(), 0); -- Trà Đào Cam Sả

-- Định lượng công thức chi tiết
INSERT INTO recipe_items (id, recipe_id, ingredient_id, quantity)
VALUES
  -- Trà Sữa Trà Đen (Ceylon black tea + Sữa đặc + Đường + Nước + Đá)
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000010', 15.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000005', 40.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000023', 150.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000012', 20.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000024', 150.000), 
  
  -- Trà Sữa Matcha (Matcha powder + Sữa tươi + Sữa đặc + Nước + Đá)
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000011', 5.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000004', 120.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000005', 30.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000023', 50.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000024', 150.000), 

  -- Trà Sữa Khoai Môn (Bột trà sữa + Sữa đặc + Nước + Đá)
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000003', '56b83e80-a741-4869-97f3-8d98d255e1b3', 20.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000005', 35.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000023', 120.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000024', 150.000), 

  -- Cà Phê Dừa (Espresso + Nước cốt dừa + Sữa đặc + Đá)
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000003', 60.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000004', 'b7bba355-6a53-4df7-ae75-c23dc84c0247', 50.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000005', 30.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000024', 150.000), 

  -- Sinh Tố Xoài (Sữa tươi + Sữa đặc + Đá)
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000004', 100.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000005', 40.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000024', 200.000), 

  -- Trà Đào Cam Sả (Ceylon Black Tea + Nước + Đường + Đá)
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000010', 12.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000023', 150.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000012', 25.000), 
  (gen_random_uuid(), 'd1000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000024', 150.000);

-- ============================================================
-- 4. SIMULATION: 65 ĐƠN HÀNG LỊCH SỬ TRONG 30 NGÀY QUA
-- ============================================================
DO $$
DECLARE
  v_order_id UUID;
  v_order_item_id UUID;
  v_customer_id UUID;
  v_branch_id UUID;
  v_order_type VARCHAR;
  v_status VARCHAR;
  v_payment_method VARCHAR;
  v_payment_status VARCHAR;
  v_brewing_status VARCHAR;
  v_created_at TIMESTAMP;
  v_order_num VARCHAR;
  
  v_size_id UUID;
  v_menu_item_id UUID;
  v_subtotal NUMERIC(15,2);
  v_discount NUMERIC(15,2);
  v_final NUMERIC(15,2);
  v_points_earned INT;
  v_price NUMERIC(15,2);
  v_item_count INT;
  
  v_opt_sugar_val UUID;
  v_opt_ice_val UUID;
  v_topping_id UUID;
  v_topping_price NUMERIC(15,2);
  v_topping_name VARCHAR;
  
  i INT;
  j INT;
  
  v_customers UUID[] := ARRAY[
    'f4b78b49-7da6-4f9c-a1b6-e759d8332889'::UUID, -- Khách hàng Test
    '8ae09540-3b22-4e7e-8336-5e967e4b1fc9'::UUID, -- Nguyễn Văn Đạt
    '720517cb-ebcb-4a9b-bda0-9cf452c0769f'::UUID, -- Trần Thị Mai
    '1aa88e62-f367-4011-bc12-1ded7d325494'::UUID, -- Phạm Hồng Sơn
    '68d63a29-0231-456c-a80b-6a7134e52a33'::UUID, -- Lê Thuỳ Trang
    '792682ba-15f9-429d-b1fe-5f40db12746f'::UUID, -- Vũ Minh Quân
    'db900d72-b69d-4419-877c-642bc03d6e06'::UUID, -- Hoàng Kim Oanh
    'd47dfceb-ec39-479d-9b6b-6ab8dc50140c'::UUID, -- Ngô Tiến Dũng
    '70a3f6aa-0ace-4dc3-99e0-4bbf0d1de10a'::UUID  -- Phan Thanh Hà
  ];
  
  v_branches UUID[] := ARRAY[
    '6c4d229d-c21b-41e9-b44b-9a6dbeefb757'::UUID, -- Quận 1
    '2f9bb7bc-ea1c-4bc4-b53c-a79083b252b1'::UUID, -- Central Square
    'fc0317a1-fb35-4282-a97f-8eecc2eba4e2'::UUID  -- Quận 3
  ];
  
  v_sugar_values UUID[] := ARRAY[
    '3d3b25fd-7ea5-414e-9e66-2ff6ff9c6384'::UUID, -- Không đường
    '5f9c86ae-54e6-458e-8a8f-c5596470a66e'::UUID, -- Ít đường
    'be5d95bd-7b7e-413a-85c5-50a4fdffbf7f'::UUID, -- Bình thường
    '6458c334-35a8-4153-9a5b-caf70a1fdaea'::UUID  -- Nhiều đường
  ];

  v_ice_values UUID[] := ARRAY[
    '3b0226c7-a55a-45ba-98e3-8e7735f078aa'::UUID, -- Không đá
    'e8f35255-5e24-4c75-bba4-f44477168d9d'::UUID, -- Ít đá
    '24e67940-655b-42a4-bf31-b3f0f750cbff'::UUID  -- Đá bình thường
  ];
  
BEGIN
  -- Vòng lặp sinh 65 đơn hàng
  FOR i IN 1..65 LOOP
    -- Chọn Chi nhánh ngẫu nhiên
    v_branch_id := v_branches[1 + floor(random() * 3)::int];
    
    -- Chọn Khách hàng (30% cơ hội là Khách vãng lai, 70% Khách thành viên)
    IF random() < 0.3 THEN
      v_customer_id := NULL;
    ELSE
      v_customer_id := v_customers[1 + floor(random() * array_length(v_customers, 1))::int];
    END IF;

    -- Chọn thời gian ngẫu nhiên trong 30 ngày gần đây
    v_created_at := NOW() - (random() * INTERVAL '30 days') - (random() * INTERVAL '12 hours');

    -- Loại đơn hàng (15% Merchandise, 35% Delivery, 50% Pickup)
    IF random() < 0.15 THEN
      v_order_type := 'MERCHANDISE';
    ELSIF random() < 0.5 THEN
      v_order_type := 'DRINK_DELIVERY';
    ELSE
      v_order_type := 'DRINK_PICKUP';
    END IF;

    -- Trạng thái đơn hàng (85% COMPLETED, 10% CANCELLED, 5% PENDING)
    IF random() < 0.05 THEN
      v_status := 'PENDING';
      v_payment_status := 'PENDING';
      v_brewing_status := 'WAITING';
    ELSIF random() < 0.15 THEN
      v_status := 'CANCELLED';
      v_payment_status := 'FAILED';
      v_brewing_status := 'WAITING';
    ELSE
      v_status := 'COMPLETED';
      v_payment_status := 'COMPLETED';
      v_brewing_status := 'COMPLETED';
    END IF;

    -- Phương thức thanh toán phù hợp
    IF v_order_type = 'DRINK_DELIVERY' THEN
      v_payment_method := (ARRAY['VNPAY', 'MOMO'])[1 + floor(random() * 2)::int];
    ELSE
      v_payment_method := (ARRAY['CASH', 'QR', 'VNPAY', 'MOMO'])[1 + floor(random() * 4)::int];
    END IF;

    v_order_id := gen_random_uuid();
    v_order_num := 'ORD-' || to_char(v_created_at, 'YYYYMMDD') || '-' || lpad(i::text, 4, '0');
    v_subtotal := 0.00;

    -- Khởi tạo đơn hàng rỗng (sẽ update subtotal, discount, final sau)
    INSERT INTO orders (
      id, order_number, branch_id, customer_id, order_type, status, 
      payment_status, brewing_status, payment_method, subtotal, 
      total_discount, final_amount, shipping_fee, created_at, updated_at, 
      version, is_deleted
    )
    VALUES (
      v_order_id, v_order_num, v_branch_id, v_customer_id, v_order_type, v_status, 
      v_payment_status, v_brewing_status, v_payment_method, 0.00, 
      0.00, 0.00, CASE WHEN v_order_type = 'DRINK_DELIVERY' THEN 20000.00 ELSE 0.00 END, 
      v_created_at, v_created_at + INTERVAL '15 minutes', 0, false
    );

    -- Tạo 1 đến 3 items cho đơn hàng này
    v_item_count := 1 + floor(random() * 3)::int;
    FOR j IN 1..v_item_count LOOP
      v_order_item_id := gen_random_uuid();
      
      IF v_order_type = 'MERCHANDISE' THEN
        -- Lấy ngẫu nhiên hàng hóa
        SELECT id, base_price INTO v_menu_item_id, v_price
        FROM menu_items WHERE is_drink = false ORDER BY random() LIMIT 1;

        INSERT INTO order_items (id, order_id, menu_item_id, menu_item_size_id, quantity, unit_price, subtotal, created_at, version, is_deleted)
        VALUES (v_order_item_id, v_order_id, v_menu_item_id, NULL, 1, v_price, v_price, v_created_at, 0, false);
        
        v_subtotal := v_subtotal + v_price;
      ELSE
        -- Lấy ngẫu nhiên kích cỡ đồ uống
        SELECT id, menu_item_id, selling_price INTO v_size_id, v_menu_item_id, v_price
        FROM menu_item_sizes ORDER BY random() LIMIT 1;

        INSERT INTO order_items (id, order_id, menu_item_id, menu_item_size_id, quantity, unit_price, subtotal, created_at, version, is_deleted)
        VALUES (v_order_item_id, v_order_id, v_menu_item_id, v_size_id, 1, v_price, v_price, v_created_at, 0, false);
        
        v_subtotal := v_subtotal + v_price;

        -- Chọn Option đường
        v_opt_sugar_val := v_sugar_values[1 + floor(random() * 4)::int];
        INSERT INTO order_item_options (id, order_item_id, option_group_id, option_value_id, created_at, version, is_deleted)
        VALUES (gen_random_uuid(), v_order_item_id, '579b772b-6c01-46b6-8c9b-286cfa9de387'::UUID, v_opt_sugar_val, v_created_at, 0, false);

        -- Chọn Option đá
        v_opt_ice_val := v_ice_values[1 + floor(random() * 3)::int];
        INSERT INTO order_item_options (id, order_item_id, option_group_id, option_value_id, created_at, version, is_deleted)
        VALUES (gen_random_uuid(), v_order_item_id, '94dab9c9-acae-4a97-a736-e6e1a0976d21'::UUID, v_opt_ice_val, v_created_at, 0, false);

        -- 45% Cơ hội thêm Topping
        IF random() < 0.45 THEN
          SELECT id, extra_price, name INTO v_topping_id, v_topping_price, v_topping_name
          FROM toppings WHERE is_deleted = false ORDER BY random() LIMIT 1;
          
          IF FOUND THEN
            INSERT INTO order_item_toppings (id, order_item_id, topping_id, price_at_order, quantity, created_at, version, is_deleted)
            VALUES (gen_random_uuid(), v_order_item_id, v_topping_id, v_topping_price, 1, v_created_at, 0, false);
            
            v_subtotal := v_subtotal + v_topping_price;
          END IF;
        END IF;
      END IF;
    END LOOP;

    -- Tính toán giảm giá (15% cơ hội giảm 15K hoặc 25K)
    IF random() < 0.15 AND v_subtotal >= 45000.00 THEN
      v_discount := (ARRAY[15000.00, 25000.00])[1 + floor(random() * 2)::int];
    ELSE
      v_discount := 0.00;
    END IF;

    -- Tính số tiền cuối cùng
    v_final := v_subtotal - v_discount + CASE WHEN v_order_type = 'DRINK_DELIVERY' THEN 20000.00 ELSE 0.00 END;
    IF v_final < 0 THEN v_final := 0.00; END IF;

    -- Cập nhật lại hóa đơn
    UPDATE orders 
    SET subtotal = v_subtotal, total_discount = v_discount, final_amount = v_final 
    WHERE id = v_order_id;

    -- Thêm giao dịch thanh toán
    IF v_status <> 'PENDING' OR random() < 0.5 THEN
      INSERT INTO payment_transactions (id, order_id, amount, payment_method, type, transaction_id, description, created_at, updated_at, version, is_deleted)
      VALUES (
        gen_random_uuid(),
        v_order_id,
        v_final,
        v_payment_method,
        'PAYMENT',
        'TXN-' || to_char(v_created_at, 'YYYYMMDDHH24MISS') || '-' || lpad(i::text, 4, '0'),
        'Thanh toán cho đơn hàng ' || v_order_num,
        v_created_at,
        v_created_at + INTERVAL '5 minutes',
        0,
        false
      );
    END IF;

    -- Tích điểm Loyalty cho khách hàng thành viên
    IF v_customer_id IS NOT NULL AND v_status = 'COMPLETED' THEN
      v_points_earned := floor(v_final / 10000)::int;
      
      IF v_points_earned > 0 THEN
        -- Giao dịch cộng điểm
        INSERT INTO loyalty_point_transactions (id, user_id, order_id, points, type, description, created_at, version, is_deleted)
        VALUES (
          gen_random_uuid(),
          v_customer_id,
          v_order_id,
          v_points_earned,
          'EARN',
          'Tích điểm từ đơn hàng ' || v_order_num,
          v_created_at,
          0,
          false
        );
        
        -- Cập nhật hoặc tạo ví Loyalty của user
        INSERT INTO loyalty_points (id, user_id, points_available, total_spending, created_at, updated_at, version, is_deleted)
        VALUES (gen_random_uuid(), v_customer_id, v_points_earned, v_final, NOW(), NOW(), 0, false)
        ON CONFLICT (user_id) DO UPDATE 
        SET points_available = loyalty_points.points_available + EXCLUDED.points_available,
            total_spending = loyalty_points.total_spending + EXCLUDED.total_spending,
            updated_at = NOW();
      END IF;

      -- Đổi điểm giảm giá nếu đơn có giảm giá (1 điểm đổi 1.000đ)
      IF v_discount > 0.00 THEN
        INSERT INTO loyalty_point_transactions (id, user_id, order_id, points, type, description, created_at, version, is_deleted)
        VALUES (
          gen_random_uuid(),
          v_customer_id,
          v_order_id,
          - (v_discount / 1000)::int,
          'REDEEM',
          'Sử dụng điểm cho đơn hàng ' || v_order_num,
          v_created_at,
          0,
          false
        );
        
        UPDATE loyalty_points 
        SET points_available = points_available - (v_discount / 1000)::int,
            updated_at = NOW()
        WHERE user_id = v_customer_id;
      END IF;
    END IF;

  END LOOP;
END $$;

-- ============================================================
-- 5. CẬP NHẬT TỰ ĐỘNG HẠNG THÀNH VIÊN DỰA TRÊN TỔNG CHI TIÊU THỰC TẾ
-- ============================================================
UPDATE loyalty_points
SET membership_tier_id = CASE
  WHEN total_spending >= 15000000.00 THEN 'dd0fb5f0-dac4-4175-94f0-669d5ad28385'::UUID -- Platinum
  WHEN total_spending >= 5000000.00 THEN '94e0019b-f9be-4419-986c-3fcbd5353298'::UUID -- Gold
  WHEN total_spending >= 1000000.00 THEN '00e84867-2442-4c51-85a0-9e946aaace03'::UUID -- Silver
  ELSE 'a5fd6885-4270-4a32-ad06-65f048fee424'::UUID -- Bronze
END
WHERE is_deleted = false;

COMMIT;

-- Kiểm tra kết quả seeding sau khi thực thi
SELECT 'Chi tiết Đơn hàng (order_items)' AS bang, COUNT(*) AS so_luong FROM order_items
UNION ALL
SELECT 'Đơn hàng (orders)', COUNT(*) FROM orders
UNION ALL
SELECT 'Giao dịch thanh toán', COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'Giao dịch tích điểm (loyalty_point_transactions)', COUNT(*) FROM loyalty_point_transactions
UNION ALL
SELECT 'Công thức (recipes)', COUNT(*) FROM recipes
UNION ALL
SELECT 'Thành phần công thức (recipe_items)', COUNT(*) FROM recipe_items
UNION ALL
SELECT 'Bản ghi tồn kho chi nhánh', COUNT(*) FROM ingredient_stock;
