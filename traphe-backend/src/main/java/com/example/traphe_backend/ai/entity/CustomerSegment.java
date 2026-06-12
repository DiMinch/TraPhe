package com.example.traphe_backend.ai.entity;

import com.example.traphe_backend.ai.enums.CustomerSegmentEnum;
import com.example.traphe_backend.entity.BaseEntity;
import com.example.traphe_backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_customer_segments")
public class CustomerSegment extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private User customer;

    @Column(name = "recency_days")
    private Integer recencyDays;

    @Column(name = "frequency_count")
    private Long frequencyCount;

    @Column(name = "monetary_total", precision = 12, scale = 2)
    private BigDecimal monetaryTotal;

    @Column(name = "r_score")
    private Integer rScore;

    @Column(name = "f_score")
    private Integer fScore;

    @Column(name = "m_score")
    private Integer mScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "segment", nullable = false, length = 30)
    private CustomerSegmentEnum segment;
}
