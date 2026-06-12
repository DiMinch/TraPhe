package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateToppingRequest {

    @NotBlank(message = "Tên topping không được để trống")
    private String name;

    @NotNull(message = "Giá topping không được để trống")
    @Min(value = 0, message = "Giá topping phải lớn hơn hoặc bằng 0")
    private BigDecimal extraPrice;

    private Boolean isAvailable;

    private String imageUrl;
}
