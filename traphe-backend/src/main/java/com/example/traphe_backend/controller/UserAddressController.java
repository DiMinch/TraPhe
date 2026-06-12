package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateUserAddressRequest;
import com.example.traphe_backend.dto.request.UpdateUserAddressRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.UserAddressResponse;
import com.example.traphe_backend.service.UserAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/addresses")
@RequiredArgsConstructor
@Tag(name = "User Addresses", description = "Quản lý địa chỉ giao hàng của người dùng đang đăng nhập")
public class UserAddressController {

    private final UserAddressService userAddressService;

    @GetMapping
    @Operation(summary = "Lấy danh sách địa chỉ", description = "Trả về tất cả địa chỉ giao hàng của user hiện tại. Địa chỉ mặc định luôn đứng đầu.")
    public ResponseEntity<ApiResponse<List<UserAddressResponse>>> getMyAddresses(Authentication auth) {
        List<UserAddressResponse> addresses = userAddressService.getAddressesByUser(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(addresses, "Danh sách địa chỉ giao hàng"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết 1 địa chỉ")
    public ResponseEntity<ApiResponse<UserAddressResponse>> getAddress(
            @PathVariable UUID id, Authentication auth) {
        UserAddressResponse address = userAddressService.getAddressById(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(address, "Chi tiết địa chỉ"));
    }

    @PostMapping
    @Operation(summary = "Thêm địa chỉ giao hàng mới", description = "Tạo địa chỉ mới. Nếu đây là địa chỉ đầu tiên, sẽ tự động đặt làm mặc định.")
    public ResponseEntity<ApiResponse<UserAddressResponse>> createAddress(
            @Valid @RequestBody CreateUserAddressRequest request, Authentication auth) {
        UserAddressResponse address = userAddressService.createAddress(auth.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(address, "Thêm địa chỉ thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật địa chỉ", description = "Cập nhật một phần hoặc toàn bộ thông tin địa chỉ. Chỉ cập nhật các trường được gửi lên.")
    public ResponseEntity<ApiResponse<UserAddressResponse>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserAddressRequest request,
            Authentication auth) {
        UserAddressResponse address = userAddressService.updateAddress(auth.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success(address, "Cập nhật địa chỉ thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoá địa chỉ (soft delete)", description = "Xoá địa chỉ. Nếu xoá địa chỉ mặc định, hệ thống tự đặt địa chỉ khác làm mặc định.")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID id, Authentication auth) {
        userAddressService.deleteAddress(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xoá địa chỉ thành công"));
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Đặt địa chỉ làm mặc định")
    public ResponseEntity<ApiResponse<UserAddressResponse>> setDefault(
            @PathVariable UUID id, Authentication auth) {
        UserAddressResponse address = userAddressService.setDefaultAddress(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(address, "Đã đặt làm địa chỉ mặc định"));
    }
}
