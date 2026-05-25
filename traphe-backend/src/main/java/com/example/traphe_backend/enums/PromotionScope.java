package com.example.traphe_backend.enums;

/**
 * Phạm vi hiển thị của mã khuyến mãi / voucher.
 * <ul>
 *   <li>PUBLIC  — Hiển thị cho tất cả khách hàng trên storefront.</li>
 *   <li>PERSONAL — Chỉ hiển thị cho user được gán (qua bảng user_vouchers).</li>
 * </ul>
 */
public enum PromotionScope {
    PUBLIC,
    PERSONAL,
    ORDER,
    CATEGORY,
    PRODUCT,
    SHIPPING
}
