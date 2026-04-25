package com.example.traphe_backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Công thức pha chế — mỗi món có thể có nhiều công thức theo size (S/M/L).
 * Unique constraint: (menu_item_id, size).
 * size = NULL means the recipe applies to all sizes.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recipes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"menu_item_id", "size"})
})
public class Recipe extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(length = 5)
    private String size; // S / M / L — NULL if applies to all sizes

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RecipeItem> items = new ArrayList<>();
}
