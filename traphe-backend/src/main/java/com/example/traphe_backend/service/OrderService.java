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

        // ========== 9. Set estimated ready time ==========
        if (maxPreparationTime > 0) {
            order.setEstimatedReadyTime(LocalDateTime.now().plusMinutes(maxPreparationTime));
        }

        // ========== 10. Save (cascades to items, options, toppings) ==========
        Order savedOrder = orderRepository.save(order);

        // ========== 11. Build response ==========
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
            // TODO: When loyalty_points table exists:
            //   UPDATE loyalty_points SET points_available = points_available + :pointsRefunded
            //   INSERT INTO loyalty_point_transactions (type='REFUNDED', points=:pointsRefunded, order_id=:orderId)
            log.info("Order {} — Refunding {} loyalty points to customer {}",
                    order.getOrderNumber(), pointsRefunded,
                    order.getCustomer() != null ? order.getCustomer().getEmail() : "anonymous");
        }

        // 4b. Refund payment if already completed
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            refundAmount = order.getFinalAmount();
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            // TODO: When payment gateway is integrated:
            //   Call refund API (VNPAY/MOMO) with refundAmount
            //   INSERT INTO payment_transactions (type='REFUND', amount=:refundAmount, order_id=:orderId)
            log.info("Order {} — Initiating refund of {} VND. Payment status → REFUNDED",
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
     * Generate order number: TP-YYYYMMDD-XXXX
     */
    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "TP-" + datePart + "-" + String.format("%04d", random);
    }
}
