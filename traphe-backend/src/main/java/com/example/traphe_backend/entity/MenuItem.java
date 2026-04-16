package com.example.traphe_backend.entity;

import com.example.traphe_backend.enums.MenuItemStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "menu_items")
public class MenuItem extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private MenuCategory category;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MenuItemStatus status = MenuItemStatus.ACTIVE;

    @Column(name = "is_drink", nullable = false)
    @Builder.Default
    private boolean isDrink = true;

    @Column(name = "preparation_time")
    private Integer preparationTime;

    @Column(name = "allow_toppings", nullable = false)
    @Builder.Default
    private boolean allowToppings = true;

    @Column(name = "base_price", precision = 12, scale = 2)
    private BigDecimal basePrice;
}
