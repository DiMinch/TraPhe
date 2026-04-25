package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateSupplierRequest;
import com.example.traphe_backend.dto.request.UpdateSupplierRequest;
import com.example.traphe_backend.dto.response.SupplierResponse;
import com.example.traphe_backend.entity.Supplier;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.SupplierMapstructMapper;
import com.example.traphe_backend.repository.SupplierRepository;
import com.example.traphe_backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapstructMapper supplierMapper;

    @Override
    @Transactional
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .contactName(request.getContactName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();

        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier created: {}", saved.getName());
        return supplierMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierMapper.toResponseList(supplierRepository.findByIsDeletedFalseOrderByNameAsc());
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(UUID id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));

        if (request.getName() != null) {
            supplier.setName(request.getName().trim());
        }
        if (request.getContactName() != null) {
            supplier.setContactName(request.getContactName());
        }
        if (request.getPhone() != null) {
            supplier.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            supplier.setEmail(request.getEmail());
        }
        if (request.getAddress() != null) {
            supplier.setAddress(request.getAddress());
        }

        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier updated: {}", saved.getName());
        return supplierMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void softDeleteSupplier(UUID id) {
        Supplier supplier = supplierRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại với ID: " + id));

        supplier.setDeleted(true);
        supplier.setDeletedAt(LocalDateTime.now());
        supplierRepository.save(supplier);
        log.info("Supplier soft-deleted: {}", supplier.getName());
    }
}
