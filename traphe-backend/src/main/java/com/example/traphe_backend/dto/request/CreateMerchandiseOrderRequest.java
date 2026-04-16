package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateMerchandiseOrderRequest {

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<MerchandiseOrderItemRequest> items;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
}
