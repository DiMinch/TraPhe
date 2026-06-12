package com.example.traphe_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Represents a single item in a user's shopping cart.
 * Supports TraPhe F&B domain: drinks with size/options/toppings + merchandise.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_cart_item_user_config",
                columnNames = {"user_id", "menu_item_id", "menu_item_size_id", "selected_options_hash"})
})
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    /** Size selection for drinks (S/M/L). Null for merchandise. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_size_id")
    private MenuItemSize menuItemSize;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    /** Customer note for this item, e.g. "ít đá", "nhiều đường" */
    @Column(columnDefinition = "TEXT")
    private String note;

    /**
     * Selected option values as JSON map: {"optionGroupId": "optionValueId", ...}
     * e.g. {"sugar-group-uuid": "50%-value-uuid", "ice-group-uuid": "less-ice-uuid"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_options", columnDefinition = "jsonb")
    private Map<String, String> selectedOptions;

    /**
     * Selected toppings as JSON list: [{"toppingId": "uuid", "quantity": 1}, ...]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_toppings", columnDefinition = "jsonb")
    private List<ToppingSelection> selectedToppings;

    /**
     * Hash of the configuration (size + options + toppings) to enforce uniqueness.
     * Same item with different customization = different cart row.
     */
    @Column(name = "selected_options_hash", length = 64)
    private String selectedOptionsHash;

    /** Whether this is a drink or merchandise item (cached from MenuItem) */
    @Column(name = "is_drink", nullable = false)
    @Builder.Default
    private boolean isDrink = true;

    /**
     * Inner class for topping selection stored in JSONB.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ToppingSelection {
        private UUID toppingId;
        @Builder.Default
        private int quantity = 1;
    }
}
