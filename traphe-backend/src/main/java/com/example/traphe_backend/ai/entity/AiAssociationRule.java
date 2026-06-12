package com.example.traphe_backend.ai.entity;

import com.example.traphe_backend.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_association_rules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAssociationRule extends BaseEntity {

    @Column(name = "antecedent_id", nullable = false)
    private String antecedentId; // Could be menu item ID or "CART" for cart-level

    @Column(name = "antecedent_name")
    private String antecedentName;

    @Column(name = "consequent_id", nullable = false)
    private String consequentId;

    @Column(name = "consequent_name")
    private String consequentName;

    @Column(name = "consequent_type", nullable = false)
    private String consequentType; // "MENU_ITEM", "TOPPING"

    @Column(name = "support")
    private double support;

    @Column(name = "confidence")
    private double confidence;

    @Column(name = "lift")
    private double lift;
}
