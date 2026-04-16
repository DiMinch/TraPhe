package com.example.traphe_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Format must be a valid email address")
    private String email;

    /**
     * OTP type: EMAIL_VERIFY or PASSWORD_RESET
     */
    @NotBlank(message = "Type is required")
    private String type;
}
