package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateSupplierRequest;
import com.example.traphe_backend.dto.request.UpdateSupplierRequest;
import com.example.traphe_backend.dto.response.SupplierResponse;

import java.util.List;
import java.util.UUID;

public interface SupplierService {

    SupplierResponse createSupplier(CreateSupplierRequest request);

    List<SupplierResponse> getAllSuppliers();

    SupplierResponse updateSupplier(UUID id, UpdateSupplierRequest request);

    void softDeleteSupplier(UUID id);
}
