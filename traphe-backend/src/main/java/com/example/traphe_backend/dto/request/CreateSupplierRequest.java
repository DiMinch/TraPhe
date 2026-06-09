package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierRequest {

    @NotBlank(message = "Tên nhà cung cấp không được trống")
    private String name;

    private String contactName;
    private String phone;
    private String email;
    private String address;
}
