package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserAddressRequest {

    @Size(max = 100)
    private String recipientName;

    @Size(max = 20)
    private String recipientPhone;

    @Size(max = 255)
    private String addressLine;

    @Size(max = 10)
    private String wardCode;

    @Size(max = 100)
    private String wardName;

    @Size(max = 10)
    private String provinceCode;

    @Size(max = 100)
    private String provinceName;

    private Boolean isDefault;
}
