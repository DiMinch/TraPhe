package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.OrderService;
import com.example.traphe_backend.service.*;

import com.example.traphe_backend.dto.request.CreateDrinkOrderRequest;
import com.example.traphe_backend.dto.request.OrderItemOptionRequest;
import com.example.traphe_backend.dto.request.OrderItemRequest;
import com.example.traphe_backend.dto.request.OrderItemToppingRequest;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.entity.Branch;
import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemOptionGroup;
import com.example.traphe_backend.entity.MenuItemSize;
import com.example.traphe_backend.entity.OptionGroup;
import com.example.traphe_backend.entity.OptionValue;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.OrderItem;
import com.example.traphe_backend.entity.OrderItemOption;
import com.example.traphe_backend.entity.OrderItemTopping;
import com.example.traphe_backend.entity.Topping;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import com.example.traphe_backend.exception.BranchNotActiveException;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.repository.BranchRepository;
import com.example.traphe_backend.repository.MenuItemOptionGroupRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.MenuItemSizeRepository;
import com.example.traphe_backend.repository.MenuItemToppingRepository;
import com.example.traphe_backend.repository.OptionGroupRepository;
import com.example.traphe_backend.repository.OptionValueRepository;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.ToppingRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.repository.UserAddressRepository;
import com.example.traphe_backend.entity.UserAddress;
import com.example.traphe_backend.dto.request.CreateMerchandiseOrderRequest;
import com.example.traphe_backend.dto.request.MerchandiseOrderItemRequest;
import com.example.traphe_backend.dto.response.MerchandiseOrderResponse;
import com.example.traphe_backend.service.MerchandiseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MenuItemOptionGroupRepository menuItemOptionGroupRepository;
    private final OptionGroupRepository optionGroupRepository;
    private final OptionValueRepository optionValueRepository;
    private final ToppingRepository toppingRepository;
    private final MenuItemToppingRepository menuItemToppingRepository;
    private final UserRepository userRepository;
    private final LoyaltyService loyaltyService;
    private final PaymentService paymentService;
    private final PromotionService promotionService;
    private final InventoryDeductionService inventoryDeductionService;
    private final jakarta.servlet.http.HttpServletRequest httpServletRequest;
    private final UserAddressRepository userAddressRepository;
    private final MerchandiseOrderService merchandiseOrderService;

    @Transactional
    public OrderResponse createDrinkOrder(CreateDrinkOrderRequest request, String userEmail) {

        // ========== 1. Resolve customer (authenticated user) ==========
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ========== 2. Validate branch ==========
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Branch not found with ID: " + request.getBranchId()));

        if (branch.isDeleted()) {
            throw new ResourceNotFoundException("Branch not found with ID: " + request.getBranchId());
        }

        if (!branch.isActive()) {
            throw new BranchNotActiveException(
                    "Chi nhánh '" + branch.getName() + "' hiện không hoạt động. Vui lòng chọn chi nhánh khác.");
        }

        // ========== 3. Parse order type ==========
        OrderType orderType;
        try {
            orderType = OrderType.valueOf(request.getOrderType());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Order type không hợp lệ: " + request.getOrderType()
                            + ". Chỉ chấp nhận: DRINK_PICKUP, DRINK_DELIVERY");
        }

        if (orderType == OrderType.DRINK_DELIVERY && request.getDeliveryAddressId() == null) {
            throw new IllegalArgumentException("Delivery address is required for DRINK_DELIVERY orders");
        }

        // ========== 4. Parse payment method ==========
        PaymentMethod paymentMethod = null;
        if (request.getPaymentMethod() != null) {
            try {
                paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Payment method không hợp lệ: " + request.getPaymentMethod());
            }
        }

        // ========== 5. PRE-FETCH DATA (BATCHING TO FIX N+1) ==========
        Set<UUID> menuItemIds = new HashSet<>();
        Set<UUID> sizeIds = new HashSet<>();
        Set<UUID> optionGroupIds = new HashSet<>();
        Set<UUID> optionValueIds = new HashSet<>();
        Set<UUID> toppingIds = new HashSet<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            menuItemIds.add(itemReq.getMenuItemId());
            if (itemReq.getMenuItemSizeId() != null) {
                sizeIds.add(itemReq.getMenuItemSizeId());
            }
            if (itemReq.getOptions() != null) {
                for (OrderItemOptionRequest optReq : itemReq.getOptions()) {
                    optionGroupIds.add(optReq.getOptionGroupId());
                    optionValueIds.add(optReq.getOptionValueId());
                }
            }
            if (itemReq.getToppings() != null) {
                for (OrderItemToppingRequest topReq : itemReq.getToppings()) {
                    toppingIds.add(topReq.getToppingId());
                }
            }
        }

        // Fetch Maps
        Map<UUID, MenuItem> menuItemMap = menuItemRepository.findAllById(menuItemIds).stream()
                .collect(Collectors.toMap(MenuItem::getId, item -> item));

        Map<UUID, BranchMenuItem> branchMenuItemMap = branchMenuItemRepository
                .findAllByBranchIdAndMenuItemIdIn(branch.getId(), new ArrayList<>(menuItemIds)).stream()
                .collect(Collectors.toMap(bmi -> bmi.getMenuItem().getId(), bmi -> bmi));

        Map<UUID, MenuItemSize> sizeMap = menuItemSizeRepository.findAllById(sizeIds).stream()
                .collect(Collectors.toMap(MenuItemSize::getId, size -> size));

        Map<UUID, OptionGroup> optionGroupMap = optionGroupRepository.findAllById(optionGroupIds).stream()
                .collect(Collectors.toMap(OptionGroup::getId, og -> og));

        Map<UUID, OptionValue> optionValueMap = optionValueRepository.findAllById(optionValueIds).stream()
                .collect(Collectors.toMap(OptionValue::getId, ov -> ov));

        Map<UUID, Topping> toppingMap = toppingRepository.findAllById(toppingIds).stream()
                .collect(Collectors.toMap(Topping::getId, top -> top));

        // Validation mapping maps
        Map<UUID, List<MenuItemOptionGroup>> itemOptionGroupsMap = menuItemOptionGroupRepository
                .findByMenuItemIdIn(menuItemIds).stream()
                .collect(Collectors.groupingBy(miog -> miog.getMenuItem().getId()));

        Map<UUID, Set<UUID>> itemToppingsMap = menuItemToppingRepository
                .findByMenuItemIdIn(menuItemIds).stream()
                .collect(Collectors.groupingBy(
                        mit -> mit.getMenuItem().getId(),
                        Collectors.mapping(mit -> mit.getTopping().getId(), Collectors.toSet())
                ));

        // ========== 6. Build Order ==========
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .orderType(orderType)
                .branch(branch)
                .deliveryAddressId(request.getDeliveryAddressId())
                .paymentMethod(paymentMethod)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        int maxPreparationTime = 0;

        // ========== 7. Process each item with full validation using Maps ==========
        for (OrderItemRequest itemReq : request.getItems()) {

            // --- 7a. Validate menu item ---
            MenuItem menuItem = menuItemMap.get(itemReq.getMenuItemId());
            if (menuItem == null) {
                throw new ResourceNotFoundException("Menu item not found with ID: " + itemReq.getMenuItemId());
            }

            if (menuItem.isDeleted() || menuItem.getStatus() != MenuItemStatus.ACTIVE) {
                throw new IllegalArgumentException("Món '" + menuItem.getName() + "' đã ẩn hoặc không còn bán.");
            }

            if (!menuItem.isDrink()) {
                throw new IllegalArgumentException("Món '" + menuItem.getName() + "' không phải đồ uống. Vui lòng sử dụng API phù hợp.");
            }

            // --- 7b. Validate branch has this menu item ---
            BranchMenuItem branchMenuItem = branchMenuItemMap.get(menuItem.getId());
            if (branchMenuItem == null) {
                throw new IllegalArgumentException("Món '" + menuItem.getName() + "' không có tại chi nhánh '" + branch.getName() + "'.");
            }

            if (!branchMenuItem.isAvailable()) {
                String reason = branchMenuItem.getUnavailableReason() != null ? " Lý do: " + branchMenuItem.getUnavailableReason() : "";
                throw new IllegalArgumentException("Món '" + menuItem.getName() + "' hiện không bán tại chi nhánh này." + reason);
            }

            // --- 7c. Validate & resolve size ---
            MenuItemSize menuItemSize = null;
            if (itemReq.getMenuItemSizeId() != null) {
                menuItemSize = sizeMap.get(itemReq.getMenuItemSizeId());
                if (menuItemSize == null || !menuItemSize.getMenuItem().getId().equals(menuItem.getId())) {
                    throw new IllegalArgumentException("Size không hợp lệ cho món '" + menuItem.getName() + "'.");
                }
                if (menuItemSize.isDeleted()) {
                    throw new IllegalArgumentException("Size '" + menuItemSize.getSizeName() + "' không còn khả dụng.");
                }
            }

            // --- 7d. Calculate unit price ---
            BigDecimal unitPrice;
            if (branchMenuItem.getCustomPrice() != null) {
                unitPrice = branchMenuItem.getCustomPrice();
            } else if (menuItemSize != null) {
                unitPrice = menuItemSize.getSellingPrice();
            } else if (menuItem.getBasePrice() != null) {
                unitPrice = menuItem.getBasePrice();
            } else {
                throw new IllegalArgumentException("Không thể xác định giá cho món '" + menuItem.getName() + "'. Chưa có size hoặc giá gốc.");
            }

            // --- Build OrderItem ---
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .menuItemSize(menuItemSize)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(BigDecimal.ZERO) // computed below
                    .notes(itemReq.getNotes())
                    .build();

            // --- 7e. Validate & save options (sugar / ice / temperature) ---
            List<MenuItemOptionGroup> validOptionsForThisItem = itemOptionGroupsMap.getOrDefault(menuItem.getId(), new ArrayList<>());
            Set<UUID> validOptionGroupIds = validOptionsForThisItem.stream().map(og -> og.getOptionGroup().getId()).collect(Collectors.toSet());
            
            Set<UUID> providedGroupIds = new HashSet<>();

            if (itemReq.getOptions() != null && !itemReq.getOptions().isEmpty()) {
                for (OrderItemOptionRequest optReq : itemReq.getOptions()) {
                    
                    if (!validOptionGroupIds.contains(optReq.getOptionGroupId())) {
                        OptionGroup og = optionGroupMap.get(optReq.getOptionGroupId());
                        String groupName = og != null ? og.getName() : optReq.getOptionGroupId().toString();
                        throw new IllegalArgumentException("Tuỳ chọn nhóm '" + groupName + "' không hợp lệ cho món '" + menuItem.getName() + "'.");
                    }

                    OptionValue optionValue = optionValueMap.get(optReq.getOptionValueId());
                    if (optionValue == null || !optionValue.getOptionGroup().getId().equals(optReq.getOptionGroupId())) {
                        throw new IllegalArgumentException("Giá trị tuỳ chọn không hợp lệ cho nhóm tuỳ chọn đã chọn.");
                    }

                    OptionGroup optionGroup = optionGroupMap.get(optReq.getOptionGroupId());
                    providedGroupIds.add(optionGroup.getId());

                    OrderItemOption itemOption = OrderItemOption.builder()
                            .orderItem(orderItem)
                            .optionGroup(optionGroup)
                            .optionValue(optionValue)
                            .build();

                    orderItem.getSelectedOptions().add(itemOption);
                }
            }

            // Check required option groups are provided
            for (MenuItemOptionGroup miog : validOptionsForThisItem) {
                OptionGroup group = miog.getOptionGroup();
                if (group.isRequired() && !providedGroupIds.contains(group.getId())) {
                    throw new IllegalArgumentException("Thiếu tuỳ chọn bắt buộc: '" + group.getName() + "' cho món '" + menuItem.getName() + "'.");
                }
            }

            // --- 7f. Validate & save toppings ---
            BigDecimal toppingTotalPerCup = BigDecimal.ZERO;
            if (itemReq.getToppings() != null && !itemReq.getToppings().isEmpty()) {
                if (!menuItem.isAllowToppings()) {
                    throw new IllegalArgumentException("Món '" + menuItem.getName() + "' không cho phép thêm topping.");
                }

                Set<UUID> validToppingsForThisItem = itemToppingsMap.getOrDefault(menuItem.getId(), new HashSet<>());

                for (OrderItemToppingRequest topReq : itemReq.getToppings()) {
                    Topping topping = toppingMap.get(topReq.getToppingId());
                    if (topping == null) {
                        throw new ResourceNotFoundException("Topping not found with ID: " + topReq.getToppingId());
                    }

                    if (!topping.isAvailable() || topping.isDeleted()) {
                        throw new IllegalArgumentException("Topping '" + topping.getName() + "' hiện không khả dụng.");
                    }

                    if (!validToppingsForThisItem.contains(topping.getId())) {
                        throw new IllegalArgumentException("Topping '" + topping.getName() + "' không có cho món '" + menuItem.getName() + "'.");
                    }

                    OrderItemTopping itemTopping = OrderItemTopping.builder()
                            .orderItem(orderItem)
                            .topping(topping)
                            .quantity((short) topReq.getQuantity())
                            .priceAtOrder(topping.getExtraPrice()) // Snapshot price
                            .build();

                    orderItem.getSelectedToppings().add(itemTopping);

                    // Topping price added to the per-cup cumulative total
                    toppingTotalPerCup = toppingTotalPerCup.add(topping.getExtraPrice().multiply(BigDecimal.valueOf(topReq.getQuantity())));
                }
            }

            // --- 7g. Calculate item subtotal (FIXED PRICING MATH) ---
            // Item subtotal = quantity * (unitPrice + SUM(toppingPrice * toppingQty_per_cup))
            BigDecimal itemSubtotal = unitPrice.add(toppingTotalPerCup).multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            orderItem.setSubtotal(itemSubtotal);

            subtotal = subtotal.add(itemSubtotal);
            order.getItems().add(orderItem);

            // Track max preparation time
            if (menuItem.getPreparationTime() != null && menuItem.getPreparationTime() > maxPreparationTime) {
                maxPreparationTime = menuItem.getPreparationTime();
            }
        }

        // ========== 8. Calculate totals ==========
        BigDecimal shippingFee = orderType == OrderType.DRINK_DELIVERY
                ? new BigDecimal("15000") // Flat rate placeholder
                : BigDecimal.ZERO;

        order.setSubtotal(subtotal);
        order.setTotalDiscount(BigDecimal.ZERO);
        order.setShippingFee(shippingFee);
        order.setFinalAmount(subtotal.add(shippingFee));

        // ========== 9. Set estimated ready time ==========
        if (maxPreparationTime > 0) {
            order.setEstimatedReadyTime(LocalDateTime.now().plusMinutes(maxPreparationTime));
        }

        // ========== 10. Save (cascades to items, options, toppings) ==========
        Order savedOrder = orderRepository.save(order);

        // ========== 10a. Apply promotions & loyalty points ==========
        BigDecimal totalDiscount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            try {
                BigDecimal promoDiscount = promotionService.applyPromotion(request.getVoucherCode(), savedOrder, customer);
                totalDiscount = totalDiscount.add(promoDiscount);
            } catch (Exception e) {
                log.error("Failed to apply promotion: {}", e.getMessage());
                throw new IllegalArgumentException("Khuyến mãi không áp dụng được: " + e.getMessage());
            }
        }

        if (request.getLoyaltyPointsUsed() > 0) {
            try {
                BigDecimal pointDiscount = loyaltyService.redeemPoints(customer, savedOrder, request.getLoyaltyPointsUsed());
                savedOrder.setLoyaltyPointsUsed(request.getLoyaltyPointsUsed());
                savedOrder.setPointDiscountAmount(pointDiscount);
                totalDiscount = totalDiscount.add(pointDiscount);
            } catch (Exception e) {
                log.error("Failed to redeem loyalty points: {}", e.getMessage());
                throw new IllegalArgumentException("Không thể dùng điểm tích lũy: " + e.getMessage());
            }
        }

        if (totalDiscount.compareTo(BigDecimal.ZERO) > 0) {
            savedOrder.setTotalDiscount(totalDiscount);
            BigDecimal finalAmount = subtotal.subtract(totalDiscount).add(shippingFee);
            if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
                finalAmount = BigDecimal.ZERO;
            }
            savedOrder.setFinalAmount(finalAmount);
            savedOrder = orderRepository.save(savedOrder);
        }

        // ========== 11. Build response & generate payment gateway URLs ==========
        OrderResponse response = mapToOrderResponse(savedOrder);
        if (savedOrder.getPaymentStatus() == PaymentStatus.PENDING) {
            if (savedOrder.getPaymentMethod() == PaymentMethod.VNPAY) {
                String ipAddress = com.example.traphe_backend.util.VnPayUtil.getIpAddress(httpServletRequest);
                response.setPaymentUrl(paymentService.createVnPayPaymentUrl(savedOrder, ipAddress));
            } else if (savedOrder.getPaymentMethod() == PaymentMethod.MOMO) {
                response.setPaymentUrl(paymentService.createMoMoPaymentUrl(savedOrder));
            }
        }
        return response;
    }

    // ==========================================
    // PUT /api/orders/:id/status
    // ==========================================

    /**
     * Valid transitions:
     *   PENDING   → CONFIRMED
     *   CONFIRMED → COMPLETED
     * 
     * CANCELLED is NOT allowed here — use cancelOrder() via DELETE endpoint.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING,   EnumSet.of(OrderStatus.CONFIRMED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.COMPLETED)
    );

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, String newStatusStr, String userEmail) {

        // 1. Parse target status
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Trạng thái không hợp lệ: '" + newStatusStr
                    + "'. Chấp nhận: PENDING, CONFIRMED, COMPLETED, CANCELLED");
        }

        if (newStatus == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Không thể chuyển sang CANCELLED qua endpoint này. Sử dụng DELETE /api/orders/{id} để huỷ đơn.");
        }

        // 2. Find order
        Order order = findActiveOrder(orderId);

        // 3. Validate transition
        OrderStatus currentStatus = order.getStatus();
        Set<OrderStatus> allowedTargets = VALID_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));

        if (!allowedTargets.contains(newStatus)) {
            throw new IllegalArgumentException(
                    "Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus + "."
                    + " Chuyển trạng thái hợp lệ: PENDING → CONFIRMED → COMPLETED.");
        }

        // 4. Update
        order.setStatus(newStatus);

        // If CONFIRMED → update payment_status if needed
        if (newStatus == OrderStatus.COMPLETED && order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.COMPLETED);
        }

        Order saved = orderRepository.save(order);
        log.info("Order {} status updated: {} → {}", saved.getOrderNumber(), currentStatus, newStatus);

        // 5. Trigger inventory deduction when order is completed (drink orders only)
        if (newStatus == OrderStatus.COMPLETED) {
            try {
                inventoryDeductionService.deductStockForOrder(saved, userEmail);
            } catch (Exception e) {
                log.error("Stock deduction failed for order {} — {}", saved.getOrderNumber(), e.getMessage());
                throw e; // Re-throw to rollback the transaction
            }

            // 6. Auto-earn loyalty points for the customer
            if (saved.getCustomer() != null) {
                try {
                    loyaltyService.earnPointsForOrder(saved.getCustomer(), saved);
                } catch (Exception e) {
                    log.error("Loyalty point earning failed for order {} — {}", saved.getOrderNumber(), e.getMessage());
                    // Non-critical: log but don't rollback the entire transaction
                }
            }
        }

        return mapToOrderResponse(saved);
    }

    // ==========================================
    // DELETE /api/orders/:id (cancel)
    // ==========================================

    @Transactional
    public OrderResponse cancelOrder(UUID orderId, String userEmail) {

        // 1. Find order
        Order order = findActiveOrder(orderId);

        // 2. Verify ownership — only the customer who placed the order can cancel
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (order.getCustomer() != null && !order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền huỷ đơn hàng này.");
        }

        // 3. Validate cancellable status
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException(
                    "Đơn hàng " + order.getOrderNumber() + " đã hoàn thành, không thể huỷ.");
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            order.setDeleted(true);
            Order saved = orderRepository.save(order);
            log.info("Order {} is soft-deleted (hidden) from history.", order.getOrderNumber());
            return mapToOrderResponse(saved);
        }

        // 4. Process refunds
        BigDecimal refundAmount = BigDecimal.ZERO;
        int pointsRefunded = 0;

        // 4a. Refund loyalty points if used
        if (order.getLoyaltyPointsUsed() > 0) {
            pointsRefunded = order.getLoyaltyPointsUsed();
            
            if (order.getCustomer() != null) {
                loyaltyService.refundPointsForOrder(order.getCustomer(), order, pointsRefunded);
            }

            log.info("Order {} — Refunded {} loyalty points to customer {}",
                    order.getOrderNumber(), pointsRefunded,
                    order.getCustomer() != null ? order.getCustomer().getEmail() : "anonymous");
        }

        // 4b. Refund voucher usage if applied
        promotionService.refundPromotionForOrder(order);

        // 4b. Refund payment if already completed
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            refundAmount = order.getFinalAmount();
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            
            paymentService.processRefund(order, refundAmount);

            log.info("Order {} — Initiated mock refund of {} VND. Payment status → REFUNDED",
                    order.getOrderNumber(), refundAmount);
        }

        // 5. Cancel the order
        order.setStatus(OrderStatus.CANCELLED);
        // order.setDeleted(true); // Keep it visible in the customer's history

        Order saved = orderRepository.save(order);

        log.info("Order {} CANCELLED. Previous status: {}. Points refunded: {}. Amount refunded: {}",
                saved.getOrderNumber(), currentStatus, pointsRefunded, refundAmount);

        return mapToOrderResponse(saved);
    }

    // ---- Helpers ----

    /**
     * Find an order by ID, ensuring it exists and is not soft-deleted.
     */
    private Order findActiveOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Đơn hàng không tồn tại với ID: " + orderId));

        if (order.isDeleted() && order.getStatus() != OrderStatus.CANCELLED) {
            throw new ResourceNotFoundException("Đơn hàng không tồn tại với ID: " + orderId);
        }

        return order;
    }

    /**
     * Map Order entity to OrderResponse DTO.
     */
    // ==========================================
    // GET /api/orders/:id — Chi tiết đơn hàng
    // ==========================================

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Đơn hàng không tồn tại với ID: " + orderId));
        return mapToOrderResponse(order);
    }

    // ==========================================
    // GET /api/orders/user — Lịch sử đơn hàng của User
    // ==========================================

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository
                .findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToOrderResponse);
    }

    // ==========================================
    // GET /api/orders — Danh sách đơn hàng (Admin)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(String statusStr, UUID branchId, Pageable pageable) {
        OrderStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !"all-status".equalsIgnoreCase(statusStr)) {
            try {
                status = OrderStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + statusStr);
            }
        }
        return orderRepository.findAllWithFilters(status, branchId, pageable)
                .map(this::mapToOrderResponse);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        // Build item details
        List<OrderResponse.OrderItemDetail> itemDetails = order.getItems().stream()
                .map(item -> {
                    List<String> optionNames = item.getSelectedOptions().stream()
                            .map(opt -> opt.getOptionGroup().getName() + ": " + opt.getOptionValue().getLabel())
                            .collect(Collectors.toList());
                    List<String> toppingNames = item.getSelectedToppings().stream()
                            .map(top -> top.getTopping().getName() + (top.getQuantity() > 1 ? " x" + top.getQuantity() : ""))
                            .collect(Collectors.toList());
                    return OrderResponse.OrderItemDetail.builder()
                            .id(item.getId())
                            .menuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : null)
                            .sizeName(item.getMenuItemSize() != null ? item.getMenuItemSize().getSizeName() : null)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getSubtotal())
                            .notes(item.getNotes())
                            .options(optionNames)
                            .toppings(toppingNames)
                            .build();
                }).collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .orderType(order.getOrderType() != null ? order.getOrderType().name() : null)
                .status(order.getStatus().name())
                .brewingStatus(order.getBrewingStatus() != null ? order.getBrewingStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .subtotal(order.getSubtotal())
                .totalDiscount(order.getTotalDiscount())
                .shippingFee(order.getShippingFee())
                .finalAmount(order.getFinalAmount())
                .loyaltyPointsUsed(order.getLoyaltyPointsUsed())
                .branchId(order.getBranch() != null ? order.getBranch().getId() : null)
                .branchName(order.getBranch() != null ? order.getBranch().getName() : null)
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhoneNumber() : null)
                .estimatedReadyTime(order.getEstimatedReadyTime())
                .createdAt(order.getCreatedAt())
                .items(itemDetails)
                .paymentUrl(null)
                .build();
    }

    @Transactional
    public OrderResponse createCompatibleOrder(Map<String, Object> payload, String userEmail) {
        log.info("Processing compatible order creation for: {}", userEmail);

        // 1. Resolve Branch ID
        UUID branchId = null;
        if (payload.containsKey("branchId") && payload.get("branchId") != null) {
            branchId = UUID.fromString(payload.get("branchId").toString());
        } else {
            branchId = branchRepository.findAll().stream()
                    .filter(b -> !b.isDeleted())
                    .map(Branch::getId)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No active branch found"));
        }

        // 2. Resolve items and split by Drink vs Merchandise
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");

        List<Map<String, Object>> drinkItemsMaps = new java.util.ArrayList<>();
        List<Map<String, Object>> merchandiseItemsMaps = new java.util.ArrayList<>();

        if (itemsList != null) {
            for (Map<String, Object> itemMap : itemsList) {
                String variantIdStr = (String) itemMap.get("productVariantId");
                UUID variantId = UUID.fromString(variantIdStr);

                boolean isDrink = true;
                if (menuItemSizeRepository.existsById(variantId)) {
                    isDrink = true;
                } else {
                    MenuItem menuItem = menuItemRepository.findById(variantId).orElse(null);
                    if (menuItem != null) {
                        isDrink = menuItem.isDrink();
                    }
                }

                if (isDrink) {
                    drinkItemsMaps.add(itemMap);
                } else {
                    merchandiseItemsMaps.add(itemMap);
                }
            }
        }

        // Map merchandise items request
        List<MerchandiseOrderItemRequest> mappedMerchItems = new java.util.ArrayList<>();
        for (Map<String, Object> itemMap : merchandiseItemsMaps) {
            String variantIdStr = (String) itemMap.get("productVariantId");
            UUID variantId = UUID.fromString(variantIdStr);
            int qty = itemMap.containsKey("quantity") ? ((Number) itemMap.get("quantity")).intValue() : 1;

            MerchandiseOrderItemRequest itemReq = new MerchandiseOrderItemRequest();
            itemReq.setMenuItemId(variantId);
            itemReq.setQuantity(qty);
            mappedMerchItems.add(itemReq);
        }

        // Handle case where only merchandise items exist
        if (drinkItemsMaps.isEmpty() && !merchandiseItemsMaps.isEmpty()) {
            CreateMerchandiseOrderRequest merchReq = new CreateMerchandiseOrderRequest();
            merchReq.setBranchId(branchId);
            merchReq.setItems(mappedMerchItems);

            String shippingAddress = "Store Pickup"; // default
            if (payload.containsKey("shippingAddress") && payload.get("shippingAddress") != null) {
                shippingAddress = payload.get("shippingAddress").toString();
            } else if (payload.containsKey("addressId") && payload.get("addressId") != null) {
                UUID addrId = UUID.fromString(payload.get("addressId").toString());
                UserAddress addr = userAddressRepository.findById(addrId).orElse(null);
                if (addr != null) {
                    shippingAddress = addr.getAddressLine() + ", " + addr.getWardName() + ", " + addr.getProvinceName();
                }
            }
            merchReq.setShippingAddress(shippingAddress);

            MerchandiseOrderResponse merchRes = merchandiseOrderService.createMerchandiseOrder(merchReq, userEmail);

            return OrderResponse.builder()
                    .orderId(merchRes.getOrderId())
                    .orderNumber(merchRes.getOrderNumber())
                    .orderType("MERCHANDISE")
                    .status(merchRes.getStatus())
                    .subtotal(merchRes.getSubtotal())
                    .finalAmount(merchRes.getFinalAmount())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        // Otherwise process drinks, map drink items request
        List<OrderItemRequest> mappedDrinkItems = new java.util.ArrayList<>();
        for (Map<String, Object> itemMap : drinkItemsMaps) {
            String variantIdStr = (String) itemMap.get("productVariantId");
            UUID variantId = UUID.fromString(variantIdStr);
            int qty = itemMap.containsKey("quantity") ? ((Number) itemMap.get("quantity")).intValue() : 1;

            OrderItemRequest itemReq = new OrderItemRequest();
            itemReq.setQuantity(qty);

            if (itemMap.containsKey("notes")) {
                itemReq.setNotes((String) itemMap.get("notes"));
            }

            if (itemMap.containsKey("options") && itemMap.get("options") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> optsList = (List<Map<String, Object>>) itemMap.get("options");
                List<OrderItemOptionRequest> optionRequests = new java.util.ArrayList<>();
                for (Map<String, Object> optMap : optsList) {
                    OrderItemOptionRequest optReq = new OrderItemOptionRequest();
                    optReq.setOptionGroupId(UUID.fromString((String) optMap.get("optionGroupId")));
                    optReq.setOptionValueId(UUID.fromString((String) optMap.get("optionValueId")));
                    optionRequests.add(optReq);
                }
                itemReq.setOptions(optionRequests);
            }

            if (itemMap.containsKey("toppings") && itemMap.get("toppings") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> topsList = (List<Map<String, Object>>) itemMap.get("toppings");
                List<OrderItemToppingRequest> toppingRequests = new java.util.ArrayList<>();
                for (Map<String, Object> topMap : topsList) {
                    OrderItemToppingRequest topReq = new OrderItemToppingRequest();
                    topReq.setToppingId(UUID.fromString((String) topMap.get("toppingId")));
                    topReq.setQuantity(topMap.containsKey("quantity") ? ((Number) topMap.get("quantity")).intValue() : 1);
                    toppingRequests.add(topReq);
                }
                itemReq.setToppings(toppingRequests);
            }

            // Check if variantId is a MenuItemSize
            if (menuItemSizeRepository.existsById(variantId)) {
                MenuItemSize size = menuItemSizeRepository.findById(variantId).orElse(null);
                if (size != null) {
                    itemReq.setMenuItemSizeId(size.getId());
                    if (size.getMenuItem() != null) {
                        itemReq.setMenuItemId(size.getMenuItem().getId());
                    }
                }
            } else {
                itemReq.setMenuItemId(variantId);
            }
            mappedDrinkItems.add(itemReq);
        }

        // Construct CreateDrinkOrderRequest
        CreateDrinkOrderRequest drinkReq = new CreateDrinkOrderRequest();
        drinkReq.setBranchId(branchId);
        drinkReq.setItems(mappedDrinkItems);

        // Resolve order type
        String orderType = (String) payload.get("orderType");
        if ("ONLINE_COD".equals(orderType) || "ONLINE_TRANSFER".equals(orderType)) {
            drinkReq.setOrderType("DRINK_DELIVERY");
        } else {
            drinkReq.setOrderType("DRINK_PICKUP");
        }

        // Resolve delivery address
        if (payload.containsKey("addressId") && payload.get("addressId") != null) {
            drinkReq.setDeliveryAddressId(UUID.fromString(payload.get("addressId").toString()));
        }

        String paymentMethod = (String) payload.get("paymentMethod");
        drinkReq.setPaymentMethod(paymentMethod != null ? paymentMethod : "CASH");

        // Create drink order
        OrderResponse drinkOrderResponse = createDrinkOrder(drinkReq, userEmail);

        // If there are also merchandise items, create a merchandise order and link it
        if (!merchandiseItemsMaps.isEmpty()) {
            CreateMerchandiseOrderRequest merchReq = new CreateMerchandiseOrderRequest();
            merchReq.setBranchId(branchId);
            merchReq.setItems(mappedMerchItems);

            String shippingAddress = "Store Pickup"; // default
            if (payload.containsKey("shippingAddress") && payload.get("shippingAddress") != null) {
                shippingAddress = payload.get("shippingAddress").toString();
            } else if (payload.containsKey("addressId") && payload.get("addressId") != null) {
                UUID addrId = UUID.fromString(payload.get("addressId").toString());
                UserAddress addr = userAddressRepository.findById(addrId).orElse(null);
                if (addr != null) {
                    shippingAddress = addr.getAddressLine() + ", " + addr.getWardName() + ", " + addr.getProvinceName();
                }
            }
            merchReq.setShippingAddress(shippingAddress);

            MerchandiseOrderResponse merchRes = merchandiseOrderService.createMerchandiseOrder(merchReq, userEmail);
            drinkOrderResponse.setMerchandiseOrderId(merchRes.getOrderId());
        }

        return drinkOrderResponse;
    }

    /**
     * Generate order number: TP-YYYYMMDD-XXXX
     */
    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "TP-" + datePart + "-" + String.format("%04d", random);
    }
}
