package com.example.traphe_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ingredients")
public class Ingredient extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "min_stock_alert", precision = 10, scale = 2)
    private BigDecimal minStockAlert;

    @Column(length = 50, unique = true)
    private String barcode;

    @Column(length = 50, unique = true)
    private String sku;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
