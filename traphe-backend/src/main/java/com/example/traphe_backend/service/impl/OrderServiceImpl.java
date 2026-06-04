package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.OrderService;
import com.example.traphe_backend.service.*;

import com.example.traphe_backend.dto.request.CreateCompatibleOrderRequest;
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
    private final OrderQueryService orderQueryService;

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

        // 2. Verify ownership — only the customer who placed the order can cancel (unless they are admin/manager/cashier)
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isStaff = customer.getRoles().stream()
                .anyMatch(r -> r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_ADMIN 
                            || r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_BRANCH_MANAGER 
                            || r.getName() == com.example.traphe_backend.enums.RoleName.ROLE_CASHIER);

        if (!isStaff && order.getCustomer() != null && !order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền huỷ đơn hàng này.");
        }

        // 3. Validate cancellable status — per BA spec, only PENDING orders can be cancelled
        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == OrderStatus.CANCELLED) {
            // Already cancelled — soft-delete to hide from history
            order.setDeleted(true);
            Order saved = orderRepository.save(order);
            log.info("Order {} is soft-deleted (hidden) from history.", order.getOrderNumber());
            return mapToOrderResponse(saved);
        }

        if (currentStatus != OrderStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Chỉ có thể huỷ đơn hàng ở trạng thái PENDING. Đơn hàng " 
                    + order.getOrderNumber() + " đang ở trạng thái: " + currentStatus.name());
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
     * Delegates to OrderQueryService for shared mapping logic.
     */
    // ========== Delegated read-only operations → OrderQueryService ==========

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        return orderQueryService.getOrderById(orderId);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId, String userEmail) {
        return orderQueryService.getOrderById(orderId, userEmail);
    }

    @Transactional(readOnly = true)
    public Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getMyOrders(String userEmail, Pageable pageable) {
        return orderQueryService.getMyOrders(userEmail, pageable);
    }

    @Transactional(readOnly = true)
    public Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getCustomerOrders(UUID customerId, Pageable pageable) {
        return orderQueryService.getCustomerOrders(customerId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<com.example.traphe_backend.dto.response.OrderSummaryResponse> getAllOrders(String statusStr, UUID branchId, Pageable pageable) {
        return orderQueryService.getAllOrders(statusStr, branchId, pageable);
    }

    @Override
    public Page<OrderResponse> getFullOrders(String statusStr, UUID branchId, Pageable pageable) {
        return orderQueryService.getFullOrders(statusStr, branchId, pageable);
    }

    /**
     * Delegates to OrderQueryService.mapToOrderResponse.
     */
    private OrderResponse mapToOrderResponse(Order order) {
        return orderQueryService.mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse createCompatibleOrder(CreateCompatibleOrderRequest request, String userEmail) {
        log.info("Processing compatible order creation for: {}", userEmail);

        // 1. Resolve Branch ID
        UUID branchId = request.getBranchId();
        if (branchId == null) {
            branchId = branchRepository.findAll().stream()
                    .filter(b -> !b.isDeleted())
                    .map(Branch::getId)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No active branch found"));
        }

        // 2. Split items by Drink vs Merchandise
        List<CreateCompatibleOrderRequest.CompatibleOrderItem> drinkItems = new ArrayList<>();
        List<CreateCompatibleOrderRequest.CompatibleOrderItem> merchandiseItems = new ArrayList<>();

        if (request.getItems() != null) {
            for (CreateCompatibleOrderRequest.CompatibleOrderItem item : request.getItems()) {
                UUID variantId = UUID.fromString(item.getProductVariantId());

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
                    drinkItems.add(item);
                } else {
                    merchandiseItems.add(item);
                }
            }
        }

        // Map merchandise items
        List<MerchandiseOrderItemRequest> mappedMerchItems = new ArrayList<>();
        for (CreateCompatibleOrderRequest.CompatibleOrderItem item : merchandiseItems) {
            UUID variantId = UUID.fromString(item.getProductVariantId());
            MerchandiseOrderItemRequest itemReq = new MerchandiseOrderItemRequest();
            itemReq.setMenuItemId(variantId);
            itemReq.setQuantity(item.getQuantity());
            mappedMerchItems.add(itemReq);
        }

        // Handle case where only merchandise items exist
        if (drinkItems.isEmpty() && !merchandiseItems.isEmpty()) {
            CreateMerchandiseOrderRequest merchReq = new CreateMerchandiseOrderRequest();
            merchReq.setBranchId(branchId);
            merchReq.setItems(mappedMerchItems);
            merchReq.setShippingAddress(resolveShippingAddress(request));

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

        // 3. Process drink items
        List<OrderItemRequest> mappedDrinkItems = new ArrayList<>();
        for (CreateCompatibleOrderRequest.CompatibleOrderItem item : drinkItems) {
            UUID variantId = UUID.fromString(item.getProductVariantId());

            OrderItemRequest itemReq = new OrderItemRequest();
            itemReq.setQuantity(item.getQuantity());
            itemReq.setNotes(item.getNotes());

            // Map options
            if (item.getOptions() != null && !item.getOptions().isEmpty()) {
                List<OrderItemOptionRequest> optionRequests = new ArrayList<>();
                for (CreateCompatibleOrderRequest.CompatibleOrderItemOption opt : item.getOptions()) {
                    OrderItemOptionRequest optReq = new OrderItemOptionRequest();
                    optReq.setOptionGroupId(UUID.fromString(opt.getOptionGroupId()));
                    optReq.setOptionValueId(UUID.fromString(opt.getOptionValueId()));
                    optionRequests.add(optReq);
                }
                itemReq.setOptions(optionRequests);
            }

            // Map toppings
            if (item.getToppings() != null && !item.getToppings().isEmpty()) {
                List<OrderItemToppingRequest> toppingRequests = new ArrayList<>();
                for (CreateCompatibleOrderRequest.CompatibleOrderItemTopping top : item.getToppings()) {
                    OrderItemToppingRequest topReq = new OrderItemToppingRequest();
                    topReq.setToppingId(UUID.fromString(top.getToppingId()));
                    topReq.setQuantity(top.getQuantity());
                    toppingRequests.add(topReq);
                }
                itemReq.setToppings(toppingRequests);
            }

            // Resolve variant → menuItem + size
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

        // 4. Construct CreateDrinkOrderRequest
        CreateDrinkOrderRequest drinkReq = new CreateDrinkOrderRequest();
        drinkReq.setBranchId(branchId);
        drinkReq.setItems(mappedDrinkItems);

        // Resolve order type
        String orderType = request.getOrderType();
        if ("ONLINE_COD".equals(orderType) || "ONLINE_TRANSFER".equals(orderType)) {
            drinkReq.setOrderType("DRINK_DELIVERY");
        } else {
            drinkReq.setOrderType("DRINK_PICKUP");
        }

        // Delivery address
        if (request.getAddressId() != null) {
            drinkReq.setDeliveryAddressId(request.getAddressId());
        }

        // Payment method
        drinkReq.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");

        // Voucher code
        if (request.getVoucherCode() != null) {
            drinkReq.setVoucherCode(request.getVoucherCode());
        } else if (request.getPromotionCode() != null) {
            drinkReq.setVoucherCode(request.getPromotionCode());
        }

        // Loyalty points
        if (request.getLoyaltyPointsToUse() != null && request.getLoyaltyPointsToUse() > 0) {
            drinkReq.setLoyaltyPointsUsed(request.getLoyaltyPointsToUse());
        }

        // 5. Create drink order
        OrderResponse drinkOrderResponse = createDrinkOrder(drinkReq, userEmail);

        // 6. If mixed cart, also create merchandise order
        if (!merchandiseItems.isEmpty()) {
            CreateMerchandiseOrderRequest merchReq = new CreateMerchandiseOrderRequest();
            merchReq.setBranchId(branchId);
            merchReq.setItems(mappedMerchItems);
            merchReq.setShippingAddress(resolveShippingAddress(request));

            MerchandiseOrderResponse merchRes = merchandiseOrderService.createMerchandiseOrder(merchReq, userEmail);
            drinkOrderResponse.setMerchandiseOrderId(merchRes.getOrderId());
        }

        return drinkOrderResponse;
    }

    /**
     * Resolve shipping address from the compatible order request.
     */
    private String resolveShippingAddress(CreateCompatibleOrderRequest request) {
        if (request.getShippingAddress() != null) {
            return request.getShippingAddress();
        }
        if (request.getAddressId() != null) {
            UserAddress addr = userAddressRepository.findById(request.getAddressId()).orElse(null);
            if (addr != null) {
                return addr.getAddressLine() + ", " + addr.getWardName() + ", " + addr.getProvinceName();
            }
        }
        return "Store Pickup";
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
