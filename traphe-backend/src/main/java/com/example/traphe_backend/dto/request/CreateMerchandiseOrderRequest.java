package com.example.traphe_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateMerchandiseOrderRequest {

    @NotNull(message = "branchId is required")
    private UUID branchId;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<MerchandiseOrderItemRequest> items;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
}
