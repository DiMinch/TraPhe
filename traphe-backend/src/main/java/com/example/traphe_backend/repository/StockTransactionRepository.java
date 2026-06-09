package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {

    Page<StockTransaction> findByBranchIdOrderByCreatedAtDesc(UUID branchId, Pageable pageable);
}
