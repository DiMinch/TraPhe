package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.request.CreateSupplierRequest;
import com.example.traphe_backend.dto.request.UpdateSupplierRequest;
import com.example.traphe_backend.dto.response.ApiResponse;
import com.example.traphe_backend.dto.response.SupplierResponse;
import com.example.traphe_backend.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER')")
@Tag(name = "Admin Suppliers", description = "CRUD nhà cung cấp (Chỉ Admin)")
public class AdminSupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @Operation(summary = "Tạo nhà cung cấp mới")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
            @Valid @RequestBody CreateSupplierRequest request) {
        SupplierResponse result = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Nhà cung cấp đã được tạo"));
    }

    @GetMapping
    @Operation(summary = "Danh sách nhà cung cấp")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliers() {
        List<SupplierResponse> result = supplierService.getAllSuppliers();
        return ResponseEntity.ok(ApiResponse.success(result, "Danh sách nhà cung cấp"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật nhà cung cấp")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        SupplierResponse result = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Nhà cung cấp đã cập nhật"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa nhà cung cấp (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable UUID id) {
        supplierService.softDeleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Nhà cung cấp đã xóa"));
    }
}
