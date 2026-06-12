package com.example.traphe_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Địa chỉ giao hàng của khách hàng.
 * Theo cấu trúc hành chính VN mới (từ 01/07/2025): 2 cấp — Tỉnh/Thành phố → Xã/Phường.
 * Bỏ cấp Huyện/Quận.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_addresses")
public class UserAddress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Tên người nhận hàng */
    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    /** SĐT người nhận hàng */
    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;

    /** Số nhà, tên đường, ngõ/hẻm... (phần địa chỉ chi tiết do người dùng nhập) */
    @Column(name = "address_line", nullable = false, length = 255)
    private String addressLine;

    /** Mã xã/phường (theo provinces.open-api.vn v2) */
    @Column(name = "ward_code", nullable = false, length = 10)
    private String wardCode;

    /** Tên xã/phường (snapshot để hiển thị, không cần join lại) */
    @Column(name = "ward_name", nullable = false, length = 100)
    private String wardName;

    /** Mã tỉnh/thành phố (theo provinces.open-api.vn v2) */
    @Column(name = "province_code", nullable = false, length = 10)
    private String provinceCode;

    /** Tên tỉnh/thành phố (snapshot) */
    @Column(name = "province_name", nullable = false, length = 100)
    private String provinceName;

    /** Đánh dấu địa chỉ mặc định */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;
}
