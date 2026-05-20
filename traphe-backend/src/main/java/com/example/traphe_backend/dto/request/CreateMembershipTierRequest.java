package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMembershipTierRequest {

    @NotBlank(message = "Tên hạng không được để trống")
    @Size(max = 50)
    private String name;

    @Min(value = 0, message = "Cấp bậc phải >= 0")
    private int tierLevel;

    @NotNull(message = "Mức chi tiêu tối thiểu không được để trống")
    @DecimalMin(value = "0", message = "Mức chi tiêu phải >= 0")
    private BigDecimal minSpending;

    @NotNull(message = "Hệ số tích điểm không được để trống")
    @DecimalMin(value = "0", message = "Hệ số tích điểm phải >= 0")
    private BigDecimal pointEarningRate;

    @NotNull(message = "Tỷ lệ giảm giá không được để trống")
    @DecimalMin(value = "0", message = "Tỷ lệ giảm giá phải >= 0")
    private BigDecimal discountRate;

    @Size(max = 500)
    private String description;
}
