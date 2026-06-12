package com.example.traphe_backend.ai.entity;

import com.example.traphe_backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Cache kết quả dự báo nhu cầu nguyên liệu cho một chi nhánh trong 1 ngày.
 * Được tạo bởi ForecastService mỗi 6h hoặc theo yêu cầu.
 */
@Entity
@Table(name = "ai_forecast_cache",
    indexes = {
        @Index(name = "idx_forecast_branch_date", columnList = "branch_id, forecast_date"),
        @Index(name = "idx_forecast_ingredient", columnList = "ingredient_id")
    },
    uniqueConstraints = @UniqueConstraint(columnNames = {"branch_id", "ingredient_id", "forecast_date"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiForecastCache extends BaseEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "ingredient_id", nullable = false)
    private UUID ingredientId;

    @Column(name = "ingredient_name")
    private String ingredientName;

    @Column(name = "ingredient_unit")
    private String ingredientUnit;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    /** Lượng nguyên liệu dự báo cần dùng (đơn vị ingredient.unit) */
    @Column(name = "predicted_quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal predictedQuantity;

    /** Tốc độ tăng trưởng / trend (%), dùng để hiển thị badge tăng/giảm */
    @Column(name = "trend_pct", precision = 6, scale = 2)
    private BigDecimal trendPct;

    /** Mức độ tin cậy (0.0 - 1.0). Thấp khi data ít */
    @Column(name = "confidence")
    private double confidence;

    /** Số ngày lịch sử được dùng để tính */
    @Column(name = "history_days")
    private int historyDays;
}
