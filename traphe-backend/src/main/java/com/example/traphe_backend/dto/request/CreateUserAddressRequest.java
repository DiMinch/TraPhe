package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserAddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 100)
    private String recipientName;

    @NotBlank(message = "SĐT người nhận không được để trống")
    @Size(max = 20)
    private String recipientPhone;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(max = 255)
    private String addressLine;

    @NotBlank(message = "Mã xã/phường không được để trống")
    @Size(max = 10)
    private String wardCode;

    @NotBlank(message = "Tên xã/phường không được để trống")
    @Size(max = 100)
    private String wardName;

    @NotBlank(message = "Mã tỉnh/thành phố không được để trống")
    @Size(max = 10)
    private String provinceCode;

    @NotBlank(message = "Tên tỉnh/thành phố không được để trống")
    @Size(max = 100)
    private String provinceName;

    private boolean isDefault;
}
