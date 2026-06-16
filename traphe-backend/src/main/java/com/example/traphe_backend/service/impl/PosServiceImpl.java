package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.PosService;
import com.example.traphe_backend.service.InventoryDeductionService;
import com.example.traphe_backend.service.LoyaltyService;
import com.example.traphe_backend.service.NotificationService;

import com.example.traphe_backend.dto.request.CreatePosOrderRequest;
import com.example.traphe_backend.dto.request.OrderItemOptionRequest;
import com.example.traphe_backend.dto.request.OrderItemRequest;
import com.example.traphe_backend.dto.request.OrderItemToppingRequest;
import com.example.traphe_backend.dto.request.PosPaymentRequest;
import com.example.traphe_backend.dto.response.OrderResponse;
import com.example.traphe_backend.dto.response.PosCustomerResponse;
import com.example.traphe_backend.dto.response.PosMenuResponse;
import com.example.traphe_backend.dto.response.PosQueueItemResponse;
import com.example.traphe_backend.entity.*;
import com.example.traphe_backend.enums.BrewingStatus;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import com.example.traphe_backend.enums.PaymentTransactionType;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosServiceImpl implements PosService {

    private final BranchMenuItemRepository branchMenuItemRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final OptionGroupRepository optionGroupRepository;
    private final OptionValueRepository optionValueRepository;
    private final ToppingRepository toppingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final LoyaltyPointRepository loyaltyPointRepository;
    private final InventoryDeductionService inventoryDeductionService;
    private final LoyaltyService loyaltyService;
    private final NotificationService notificationService;

    public List<PosMenuResponse> getMenuByBranch(UUID branchId) {
        List<BranchMenuItem> items = branchMenuItemRepository.findByBranchId(branchId);
        return items.stream()
                .filter(bmi -> bmi.isAvailable() && !bmi.getMenuItem().isDeleted() && bmi.getMenuItem().getStatus() == MenuItemStatus.ACTIVE)
                .map(bmi -> PosMenuResponse.builder()
                        .menuItemId(bmi.getMenuItem().getId())
                        .name(bmi.getMenuItem().getName())
                        .categoryName(bmi.getMenuItem().getCategory() != null ? bmi.getMenuItem().getCategory().getName() : null)
                        .price((!bmi.getMenuItem().isDrink() && bmi.getCustomPrice() != null) ? bmi.getCustomPrice() : bmi.getMenuItem().getBasePrice())
                        .isAvailable(bmi.isAvailable())
                        .build())
                .collect(Collectors.toList());
    }

    public PosCustomerResponse lookupCustomer(String phone) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với SĐT: " + phone));

        int points = loyaltyPointRepository.findByUserId(user.getId())
                .map(LoyaltyPoint::getPointsAvailable)
                .orElse(0);

        return PosCustomerResponse.builder()
                .customerId(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .loyaltyPoints(points)
                .build();
    }

    @Transactional
    public OrderResponse createPosOrder(CreatePosOrderRequest request, String staffEmail) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        if (!branch.isActive() || branch.isDeleted()) {
            throw new IllegalArgumentException("Chi nhánh hiện không hoạt động.");
        }

        User customer = null;
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()) {
            customer = userRepository.findByPhoneNumber(request.getCustomerPhone()).orElse(null);
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .orderType(OrderType.DRINK_PICKUP) // Or IN_STORE if you have it
                .branch(branch)
                .status(OrderStatus.PENDING)
                .brewingStatus(BrewingStatus.WAITING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        int maxPrepTime = 0;

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Món không tồn tại"));

            BranchMenuItem bmi = branchMenuItemRepository.findByBranchIdAndMenuItemId(branch.getId(), menuItem.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Món không bán tại chi nhánh này"));

            if (!bmi.isAvailable()) {
                throw new IllegalArgumentException("Món " + menuItem.getName() + " hiện đã hết hàng (tồn kho).");
            }

            MenuItemSize size = null;
            if (itemReq.getMenuItemSizeId() != null) {
                size = menuItemSizeRepository.findByIdAndMenuItemId(itemReq.getMenuItemSizeId(), menuItem.getId())
                        .orElse(null);
            }

            BigDecimal unitPrice = (size != null) ? size.getSellingPrice() :
                                  (bmi.getCustomPrice() != null ? bmi.getCustomPrice() : menuItem.getBasePrice());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .menuItemSize(size)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .notes(itemReq.getNotes())
                    .build();

            // Handle options
            if (itemReq.getOptions() != null) {
                for (OrderItemOptionRequest optReq : itemReq.getOptions()) {
                    OptionGroup og = optionGroupRepository.findById(optReq.getOptionGroupId()).orElseThrow();
                    OptionValue ov = optionValueRepository.findById(optReq.getOptionValueId()).orElseThrow();
                    orderItem.getSelectedOptions().add(OrderItemOption.builder()
                            .orderItem(orderItem).optionGroup(og).optionValue(ov).build());
                }
            }

            // Handle toppings
            BigDecimal toppingTotal = BigDecimal.ZERO;
            if (itemReq.getToppings() != null) {
                for (OrderItemToppingRequest topReq : itemReq.getToppings()) {
                    Topping topping = toppingRepository.findById(topReq.getToppingId()).orElseThrow();
                    orderItem.getSelectedToppings().add(OrderItemTopping.builder()
                            .orderItem(orderItem).topping(topping)
                            .quantity((short) topReq.getQuantity())
                            .priceAtOrder(topping.getExtraPrice()).build());
                    toppingTotal = toppingTotal.add(topping.getExtraPrice().multiply(BigDecimal.valueOf(topReq.getQuantity())));
                }
            }

            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).add(toppingTotal);
            orderItem.setSubtotal(itemSubtotal);
            subtotal = subtotal.add(itemSubtotal);
            order.getItems().add(orderItem);

            if (menuItem.getPreparationTime() != null && menuItem.getPreparationTime() > maxPrepTime) {
                maxPrepTime = menuItem.getPreparationTime();
            }
        }

        order.setSubtotal(subtotal);
        order.setFinalAmount(subtotal); // MVP no discount

        if (maxPrepTime > 0) order.setEstimatedReadyTime(LocalDateTime.now().plusMinutes(maxPrepTime));

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .status(savedOrder.getStatus().name())
                .estimatedReadyTime(savedOrder.getEstimatedReadyTime())
                .finalAmount(savedOrder.getFinalAmount())
                .build();
    }

    @Transactional
    public void processPayment(UUID orderId, PosPaymentRequest req) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        PaymentMethod pm;
        try {
            pm = PaymentMethod.valueOf(req.getPaymentMethod());
        } catch (Exception e) {
            throw new IllegalArgumentException("Payment method không hợp lệ");
        }

        order.setPaymentMethod(pm);
        order.setPaymentStatus(PaymentStatus.COMPLETED);
        
        // Cập nhật trạng thái đơn (thanh toán tại quầy thường đồng nghĩa CONFIRMED luôn)
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }

        orderRepository.save(order);

        PaymentTransaction pt = PaymentTransaction.builder()
                .order(order)
                .type(PaymentTransactionType.PAYMENT)
                .paymentMethod(pm)
                .amount(order.getFinalAmount())
                .transactionId("POS-" + UUID.randomUUID().toString().substring(0, 8))
                .description("Thanh toán POS")
                .build();
        paymentTransactionRepository.save(pt);
    }

    public List<PosQueueItemResponse> getQueue(UUID branchId) {
        List<Order> orders = orderRepository.findByBranchIdAndStatusNotAndBrewingStatusNotOrderByCreatedAtAsc(
                branchId, OrderStatus.CANCELLED, BrewingStatus.COMPLETED);

        return orders.stream()
                .map(o -> PosQueueItemResponse.builder()
                        .orderId(o.getId())
                        .orderNumber(o.getOrderNumber())
                        .customerName(o.getCustomer() != null ? o.getCustomer().getFullName() : "Khách Vãng Lai")
                        .orderType(o.getOrderType().name())
                        .brewingStatus(o.getBrewingStatus().name())
                        .createdAt(o.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateBrewingStatus(UUID orderId, String statusStr) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        BrewingStatus bs;
        try {
            bs = BrewingStatus.valueOf(statusStr);
        } catch (Exception e) {
            throw new IllegalArgumentException("Brewing status không hợp lệ");
        }

        order.setBrewingStatus(bs);

        boolean justCompleted = false;
        if (bs == BrewingStatus.COMPLETED && order.getStatus() == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.COMPLETED);
            justCompleted = true;
        }

        Order saved = orderRepository.save(order);

        // ===== Auto-trigger on COMPLETED (UC22 + UC24) =====
        if (justCompleted) {
            // UC22: Trừ nguyên liệu tự động
            try {
                inventoryDeductionService.deductStockForOrder(saved, null);
            } catch (Exception e) {
                log.error("POS stock deduction failed for order {} — {}", saved.getOrderNumber(), e.getMessage());
                throw e; // Rollback to prevent data inconsistency
            }

            // UC24: Tích điểm loyalty cho khách hàng (chỉ khi có tra SĐT khách)
            if (saved.getCustomer() != null) {
                try {
                    loyaltyService.earnPointsForOrder(saved.getCustomer(), saved);
                    log.info("POS loyalty points earned for customer {} on order {}",
                            saved.getCustomer().getEmail(), saved.getOrderNumber());
                } catch (Exception e) {
                    log.error("POS loyalty earning failed for order {} — {}", saved.getOrderNumber(), e.getMessage());
                    // Non-critical: don't rollback the entire transaction
                }

                // Notify customer that their order is completed
                try {
                    notificationService.createNotification(
                        "Đơn hàng hoàn thành",
                        String.format("Đơn hàng #%s của bạn đã hoàn thành. Hãy đến nhận đồ uống nhé!", saved.getOrderNumber()),
                        com.example.traphe_backend.enums.NotificationType.ORDER,
                        saved.getBranch() != null ? saved.getBranch().getId() : null,
                        saved.getCustomer().getId(),
                        "ORDER_COMPLETED"
                    );
                } catch (Exception ex) {
                    log.error("POS completed notification failed for order {} — {}", saved.getOrderNumber(), ex.getMessage());
                }
            } else {
                log.info("POS order {} completed without customer — no loyalty points earned.", saved.getOrderNumber());
            }
        }
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "POS-" + datePart + "-" + String.format("%04d", random);
    }
}
