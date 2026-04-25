package com.example.traphe_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSupplierRequest {

    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String address;
}
