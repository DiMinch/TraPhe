package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    List<Supplier> findByIsDeletedFalseOrderByNameAsc();

    Optional<Supplier> findByIdAndIsDeletedFalse(UUID id);
}
