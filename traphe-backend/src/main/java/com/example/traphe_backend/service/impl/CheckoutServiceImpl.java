package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CheckoutRequest;
import com.example.traphe_backend.dto.response.CheckoutResponse;
import com.example.traphe_backend.entity.CombinedCheckout;
import com.example.traphe_backend.entity.Order;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.OrderStatus;
import com.example.traphe_backend.enums.OrderType;
import com.example.traphe_backend.enums.PaymentMethod;
import com.example.traphe_backend.enums.PaymentStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.CombinedCheckoutRepository;
import com.example.traphe_backend.repository.OrderRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.CheckoutService;
import com.example.traphe_backend.service.LoyaltyService;
import com.example.traphe_backend.service.PaymentService;
import com.example.traphe_backend.service.PromotionService;
import com.example.traphe_backend.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {

    private final OrderRepository orderRepository;
    private final CombinedCheckoutRepository combinedCheckoutRepository;
    private final UserRepository userRepository;
    private final PromotionService promotionService;
    private final LoyaltyService loyaltyService;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, String userEmail) {

        // ========== 1. Resolve customer ==========
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ========== 2. Validate at least one order ==========
        if (request.getDrinkOrderId() == null && request.getMerchandiseOrderId() == null) {
            throw new IllegalArgumentException(
                    "Phải cung cấp ít nhất 1 đơn hàng (drinkOrderId hoặc merchandiseOrderId).");
        }

        // ========== 3. Parse payment method ==========
        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không hợp lệ: " + request.getPaymentMethod()
                            + ". Chấp nhận: VNPAY, MOMO, CASH, QR");
        }

        // ========== 4. Validate & fetch Drink Order ==========
        Order drinkOrder = null;
        BigDecimal drinkAmount = BigDecimal.ZERO;

        if (request.getDrinkOrderId() != null) {
            drinkOrder = validateOrderForCheckout(
                    request.getDrinkOrderId(), customer, "Drink", OrderType.DRINK_PICKUP, OrderType.DRINK_DELIVERY);

            // Check not already checked out
            if (combinedCheckoutRepository.existsByDrinkOrderId(drinkOrder.getId())) {
                throw new IllegalArgumentException(
                        "Đơn đồ uống " + drinkOrder.getOrderNumber() + " đã được thanh toán trước đó.");
            }

            drinkAmount = drinkOrder.getFinalAmount();
        }

        // ========== 5. Validate & fetch Merchandise Order ==========
        Order merchandiseOrder = null;
        BigDecimal merchandiseAmount = BigDecimal.ZERO;

        if (request.getMerchandiseOrderId() != null) {
            merchandiseOrder = validateOrderForCheckout(
                    request.getMerchandiseOrderId(), customer, "Merchandise", OrderType.MERCHANDISE);

            // Check not already checked out
            if (combinedCheckoutRepository.existsByMerchandiseOrderId(merchandiseOrder.getId())) {
                throw new IllegalArgumentException(
                        "Đơn merchandise " + merchandiseOrder.getOrderNumber() + " đã được thanh toán trước đó.");
            }

            merchandiseAmount = merchandiseOrder.getFinalAmount();
        }

        // ========== 6. Calculate totals ==========
        BigDecimal totalAmount = drinkAmount.add(merchandiseAmount);
        BigDecimal discountAmount = BigDecimal.ZERO;

        // --- Apply voucher code (if provided) ---
        Order primaryOrder = drinkOrder != null ? drinkOrder : merchandiseOrder;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            try {
                BigDecimal voucherDiscount = promotionService.applyPromotion(
                        request.getVoucherCode(), primaryOrder, customer);
                discountAmount = discountAmount.add(voucherDiscount);
                log.info("Applied voucher '{}' — discount {} VND", request.getVoucherCode(), voucherDiscount);
            } catch (Exception e) {
                log.warn("Voucher '{}' could not be applied: {}", request.getVoucherCode(), e.getMessage());
                // Không throw — cho phép checkout tiếp mà không có giảm giá voucher
            }
        }

        // --- Redeem loyalty points (if requested) ---
        if (request.getPointsUsed() > 0) {
            try {
                BigDecimal pointsDiscount = loyaltyService.redeemPoints(
                        customer, primaryOrder, request.getPointsUsed());
                discountAmount = discountAmount.add(pointsDiscount);
                log.info("Redeemed {} loyalty points — discount {} VND", request.getPointsUsed(), pointsDiscount);
            } catch (Exception e) {
                log.warn("Could not redeem {} points: {}", request.getPointsUsed(), e.getMessage());
            }
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        // ========== 7. Generate unique transaction reference ==========
        String transactionRef = generateTransactionRef();

        // ========== 8. Create CombinedCheckout ==========
        CombinedCheckout checkout = CombinedCheckout.builder()
                .customer(customer)
                .drinkOrder(drinkOrder)
                .merchandiseOrder(merchandiseOrder)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(paymentMethod)
                .transactionRef(transactionRef)
                .build();

        // ========== 9. Link combinedCheckoutId to orders ==========
        CombinedCheckout savedCheckout = combinedCheckoutRepository.save(checkout);

        if (drinkOrder != null) {
            drinkOrder.setCombinedCheckoutId(savedCheckout.getId());
        }
        if (merchandiseOrder != null) {
            merchandiseOrder.setCombinedCheckoutId(savedCheckout.getId());
        }

        // ========== 10. Process payment ==========
        String paymentUrl = null;

        if (paymentMethod == PaymentMethod.VNPAY || paymentMethod == PaymentMethod.MOMO) {
            // Online payment — generate redirect URL, status stays PENDING until IPN
            savedCheckout.setPaymentStatus(PaymentStatus.PENDING);

            if (paymentMethod == PaymentMethod.VNPAY) {
                String clientIp = VnPayUtil.getClientIp(
                        ((jakarta.servlet.http.HttpServletRequest)
                                org.springframework.web.context.request.RequestContextHolder
                                        .currentRequestAttributes()
                                        instanceof org.springframework.web.context.request.ServletRequestAttributes sra
                                ? sra.getRequest() : null));
                paymentUrl = paymentService.createVnPayPaymentUrl(primaryOrder, clientIp != null ? clientIp : "127.0.0.1");
            } else {
                paymentUrl = paymentService.createMoMoPaymentUrl(primaryOrder);
            }

            log.info("Online checkout {} PENDING — redirecting to {}", transactionRef, paymentMethod);
        } else {
            // CASH / QR — mark as completed immediately
            savedCheckout.setPaymentStatus(PaymentStatus.COMPLETED);

            if (drinkOrder != null) {
                drinkOrder.setPaymentStatus(PaymentStatus.COMPLETED);
                drinkOrder.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(drinkOrder);
            }
            if (merchandiseOrder != null) {
                merchandiseOrder.setPaymentStatus(PaymentStatus.COMPLETED);
                merchandiseOrder.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(merchandiseOrder);
            }

            log.info("Checkout {} COMPLETED. Drink: {}, Merchandise: {}, Total: {}",
                    transactionRef,
                    drinkOrder != null ? drinkOrder.getOrderNumber() : "N/A",
                    merchandiseOrder != null ? merchandiseOrder.getOrderNumber() : "N/A",
                    finalAmount);
        }

        combinedCheckoutRepository.save(savedCheckout);

        // ========== 11. Return response ==========
        return CheckoutResponse.builder()
                .checkoutId(savedCheckout.getId())
                .totalAmount(totalAmount)
                .discount(discountAmount)
                .finalAmount(finalAmount)
                .paymentStatus(savedCheckout.getPaymentStatus().name())
                .transactionRef(transactionRef)
                .paymentUrl(paymentUrl)
                .build();
    }

    // ==================== Helpers ====================

    /**
     * Validate that an order exists, belongs to the customer, is PENDING, and has the correct type.
     */
    private Order validateOrderForCheckout(UUID orderId, User customer, String label, OrderType... validTypes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Đơn hàng " + label + " không tồn tại với ID: " + orderId));

        if (order.isDeleted()) {
            throw new ResourceNotFoundException("Đơn hàng " + label + " không tồn tại với ID: " + orderId);
        }

        // Ownership check
        if (order.getCustomer() == null || !order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền thanh toán đơn hàng này.");
        }

        // Status check
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Đơn " + order.getOrderNumber() + " không ở trạng thái PENDING (hiện tại: "
                            + order.getStatus() + "). Chỉ đơn PENDING mới thanh toán được.");
        }

        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Đơn " + order.getOrderNumber() + " đã được xử lý thanh toán (trạng thái: "
                            + order.getPaymentStatus() + ").");
        }

        // Type check
        boolean typeValid = false;
        for (OrderType vt : validTypes) {
            if (order.getOrderType() == vt) {
                typeValid = true;
                break;
            }
        }
        if (!typeValid) {
            throw new IllegalArgumentException(
                    "Đơn " + order.getOrderNumber() + " không phải là đơn " + label + ".");
        }

        return order;
    }

    /**
     * Generate unique transaction reference: CK-YYYYMMDD-UUID_SHORT
     */
    private String generateTransactionRef() {
        String datePart = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuidShort = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "CK-" + datePart + "-" + uuidShort;
    }
}
