package com.example.traphe_backend.service;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
public class OrderService {

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

        // ========== 5. Build Order ==========
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

        // ========== 6. Process each item with full validation ==========
        for (OrderItemRequest itemReq : request.getItems()) {

            // --- 6a. Validate menu item ---
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Menu item not found with ID: " + itemReq.getMenuItemId()));

            if (menuItem.isDeleted() || menuItem.getStatus() != MenuItemStatus.ACTIVE) {
                throw new IllegalArgumentException(
                        "Món '" + menuItem.getName() + "' đã ẩn hoặc không còn bán.");
            }

            if (!menuItem.isDrink()) {
                throw new IllegalArgumentException(
                        "Món '" + menuItem.getName() + "' không phải đồ uống. Vui lòng sử dụng API phù hợp.");
            }

            // --- 6b. Validate branch has this menu item ---
            BranchMenuItem branchMenuItem = branchMenuItemRepository
                    .findByBranchIdAndMenuItemId(branch.getId(), menuItem.getId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Món '" + menuItem.getName() + "' không có tại chi nhánh '" + branch.getName() + "'."));

            if (!branchMenuItem.isAvailable()) {
                String reason = branchMenuItem.getUnavailableReason() != null
                        ? " Lý do: " + branchMenuItem.getUnavailableReason()
                        : "";
                throw new IllegalArgumentException(
                        "Món '" + menuItem.getName() + "' hiện không bán tại chi nhánh này." + reason);
            }

            // --- 6c. Validate & resolve size ---
            MenuItemSize menuItemSize = null;
            if (itemReq.getMenuItemSizeId() != null) {
                menuItemSize = menuItemSizeRepository
                        .findByIdAndMenuItemId(itemReq.getMenuItemSizeId(), menuItem.getId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Size không hợp lệ cho món '" + menuItem.getName() + "'."));

                if (menuItemSize.isDeleted()) {
                    throw new IllegalArgumentException(
                            "Size '" + menuItemSize.getSizeName() + "' không còn khả dụng.");
                }
            }

            // --- 6d. Calculate unit price ---
            // Priority: custom_price (branch) → selling_price (size) → base_price (item)
            BigDecimal unitPrice;
            if (branchMenuItem.getCustomPrice() != null) {
                unitPrice = branchMenuItem.getCustomPrice();
            } else if (menuItemSize != null) {
                unitPrice = menuItemSize.getSellingPrice();
            } else if (menuItem.getBasePrice() != null) {
                unitPrice = menuItem.getBasePrice();
            } else {
                throw new IllegalArgumentException(
                        "Không thể xác định giá cho món '" + menuItem.getName() + "'. Chưa có size hoặc giá gốc.");
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

            // --- 6e. Validate & save options (sugar / ice / temperature) ---
            if (itemReq.getOptions() != null && !itemReq.getOptions().isEmpty()) {
                for (OrderItemOptionRequest optReq : itemReq.getOptions()) {
                    // Check option group belongs to this menu item
                    boolean groupBelongsToItem = menuItemOptionGroupRepository
                            .existsByMenuItemIdAndOptionGroupId(menuItem.getId(), optReq.getOptionGroupId());

                    if (!groupBelongsToItem) {
                        OptionGroup og = optionGroupRepository.findById(optReq.getOptionGroupId()).orElse(null);
                        String groupName = og != null ? og.getName() : optReq.getOptionGroupId().toString();
                        throw new IllegalArgumentException(
                                "Tuỳ chọn nhóm '" + groupName + "' không hợp lệ cho món '" + menuItem.getName() + "'.");
                    }

                    // Check option value belongs to this option group
                    OptionValue optionValue = optionValueRepository
                            .findByIdAndOptionGroupId(optReq.getOptionValueId(), optReq.getOptionGroupId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Giá trị tuỳ chọn không hợp lệ cho nhóm tuỳ chọn đã chọn."));

                    OptionGroup optionGroup = optionGroupRepository.findById(optReq.getOptionGroupId())
                            .orElseThrow(() -> new ResourceNotFoundException("Option group not found"));

                    OrderItemOption itemOption = OrderItemOption.builder()
                            .orderItem(orderItem)
                            .optionGroup(optionGroup)
                            .optionValue(optionValue)
                            .build();

                    orderItem.getSelectedOptions().add(itemOption);
                }
            }

            // Check required option groups are provided
            validateRequiredOptionGroups(menuItem, itemReq.getOptions());

            // --- 6f. Validate & save toppings ---
            BigDecimal toppingTotal = BigDecimal.ZERO;
            if (itemReq.getToppings() != null && !itemReq.getToppings().isEmpty()) {
                if (!menuItem.isAllowToppings()) {
                    throw new IllegalArgumentException(
                            "Món '" + menuItem.getName() + "' không cho phép thêm topping.");
                }

                for (OrderItemToppingRequest topReq : itemReq.getToppings()) {
                    Topping topping = toppingRepository.findById(topReq.getToppingId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Topping not found with ID: " + topReq.getToppingId()));

                    if (!topping.isAvailable() || topping.isDeleted()) {
                        throw new IllegalArgumentException(
                                "Topping '" + topping.getName() + "' hiện không khả dụng.");
                    }

                    // Check topping is valid for this menu item
                    boolean toppingForItem = menuItemToppingRepository
                            .existsByMenuItemIdAndToppingId(menuItem.getId(), topping.getId());

                    if (!toppingForItem) {
                        throw new IllegalArgumentException(
                                "Topping '" + topping.getName() + "' không có cho món '" + menuItem.getName() + "'.");
                    }

                    OrderItemTopping itemTopping = OrderItemTopping.builder()
                            .orderItem(orderItem)
                            .topping(topping)
                            .quantity((short) topReq.getQuantity())
                            .priceAtOrder(topping.getExtraPrice()) // Snapshot price
                            .build();

                    orderItem.getSelectedToppings().add(itemTopping);

                    toppingTotal = toppingTotal.add(
                            topping.getExtraPrice().multiply(BigDecimal.valueOf(topReq.getQuantity())));
                }
            }

            // --- 6g. Calculate item subtotal ---
            BigDecimal itemSubtotal = unitPrice
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .add(toppingTotal);
            orderItem.setSubtotal(itemSubtotal);

            subtotal = subtotal.add(itemSubtotal);
            order.getItems().add(orderItem);

            // Track max preparation time
            if (menuItem.getPreparationTime() != null && menuItem.getPreparationTime() > maxPreparationTime) {
                maxPreparationTime = menuItem.getPreparationTime();
            }
        }

        // ========== 7. Calculate totals ==========
        // MVP: discount = 0, shipping = 0 for PICKUP
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal shippingFee = orderType == OrderType.DRINK_DELIVERY
                ? new BigDecimal("15000") // Flat rate placeholder
                : BigDecimal.ZERO;
        BigDecimal finalAmount = subtotal.subtract(totalDiscount).add(shippingFee);

        order.setSubtotal(subtotal);
        order.setTotalDiscount(totalDiscount);
        order.setShippingFee(shippingFee);
        order.setFinalAmount(finalAmount);

        // ========== 8. Set estimated ready time ==========
        if (maxPreparationTime > 0) {
            order.setEstimatedReadyTime(LocalDateTime.now().plusMinutes(maxPreparationTime));
        }

        // ========== 9. Save (cascades to items, options, toppings) ==========
        Order savedOrder = orderRepository.save(order);

        // ========== 10. Build response ==========
        return mapToOrderResponse(savedOrder);
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
            throw new IllegalArgumentException(
                    "Đơn hàng " + order.getOrderNumber() + " đã được huỷ trước đó.");
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
        order.setDeleted(true);

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
    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .estimatedReadyTime(order.getEstimatedReadyTime())
                .finalAmount(order.getFinalAmount())
                .paymentUrl(null)
                .build();
    }

    /**
     * Validate that all required option groups for the menu item have been
     * provided.
     */
    private void validateRequiredOptionGroups(MenuItem menuItem, List<OrderItemOptionRequest> providedOptions) {
        List<MenuItemOptionGroup> itemOptionGroups = menuItemOptionGroupRepository
                .findByMenuItemId(menuItem.getId());

        // Collect provided option group IDs
        Set<UUID> providedGroupIds = new HashSet<>();
        if (providedOptions != null) {
            providedGroupIds = providedOptions.stream()
                    .map(OrderItemOptionRequest::getOptionGroupId)
                    .collect(Collectors.toSet());
        }

        // Check each required group
        for (MenuItemOptionGroup miog : itemOptionGroups) {
            OptionGroup group = miog.getOptionGroup();
            if (group.isRequired() && !providedGroupIds.contains(group.getId())) {
                throw new IllegalArgumentException(
                        "Thiếu tuỳ chọn bắt buộc: '" + group.getName() + "' cho món '" + menuItem.getName() + "'.");
            }
        }
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
