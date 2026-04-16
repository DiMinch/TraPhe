package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateMerchandiseOrderRequest;
import com.example.traphe_backend.dto.request.MerchandiseOrderItemRequest;
import com.example.traphe_backend.dto.response.MerchandiseOrderResponse;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.OrderItem;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.MerchandiseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchandiseOrderServiceImpl implements MerchandiseOrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MerchandiseOrderResponse createMerchandiseOrder(CreateMerchandiseOrderRequest request, String userEmail) {

        // ========== 1. Resolve customer ==========
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ========== 2. Pre-fetch all menu items (batch — N+1 fix) ==========
        Set<UUID> menuItemIds = request.getItems().stream()
                .map(MerchandiseOrderItemRequest::getMenuItemId)
                .collect(Collectors.toSet());

        Map<UUID, MenuItem> menuItemMap = menuItemRepository.findAllById(menuItemIds).stream()
                .collect(Collectors.toMap(MenuItem::getId, item -> item));

        // ========== 3. Build Order ==========
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .orderType(OrderType.MERCHANDISE)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        // ========== 4. Process each item ==========
        for (MerchandiseOrderItemRequest itemReq : request.getItems()) {

            // --- 4a. Validate menu item ---
            MenuItem menuItem = menuItemMap.get(itemReq.getMenuItemId());
            if (menuItem == null) {
                throw new ResourceNotFoundException("Menu item not found with ID: " + itemReq.getMenuItemId());
            }

            if (menuItem.isDeleted() || menuItem.getStatus() != MenuItemStatus.ACTIVE) {
                throw new IllegalArgumentException(
                        "Sản phẩm '" + menuItem.getName() + "' đã ẩn hoặc không còn bán.");
            }

            // --- 4b. Validate this is merchandise (NOT a drink) ---
            if (menuItem.isDrink()) {
                throw new IllegalArgumentException(
                        "Sản phẩm '" + menuItem.getName() + "' là đồ uống. Vui lòng sử dụng API /orders/drink.");
            }

            // --- 4c. Calculate unit price (merchandise uses basePrice only) ---
            BigDecimal unitPrice = menuItem.getBasePrice();
            if (unitPrice == null) {
                throw new IllegalArgumentException(
                        "Không thể xác định giá cho sản phẩm '" + menuItem.getName() + "'. Chưa có giá gốc.");
            }

            // --- 4d. Build OrderItem ---
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(itemSubtotal)
                    .build();

            order.getItems().add(orderItem);
            subtotal = subtotal.add(itemSubtotal);
        }

        // ========== 5. Set totals ==========
        order.setSubtotal(subtotal);
        order.setTotalDiscount(BigDecimal.ZERO);
        order.setFinalAmount(subtotal); // No discount at this stage

        // ========== 6. Save ==========
        Order savedOrder = orderRepository.save(order);
        log.info("Merchandise order created: {} with {} items, total: {}",
                savedOrder.getOrderNumber(), savedOrder.getItems().size(), savedOrder.getFinalAmount());

        // ========== 7. Return response ==========
        return MerchandiseOrderResponse.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .status(savedOrder.getStatus().name())
                .subtotal(savedOrder.getSubtotal())
                .finalAmount(savedOrder.getFinalAmount())
                .build();
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "TP-M-" + datePart + "-" + String.format("%04d", random);
    }
}
