package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.BranchMenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchMenuItemRepository extends JpaRepository<BranchMenuItem, UUID> {

    Optional<BranchMenuItem> findByBranchIdAndMenuItemId(UUID branchId, UUID menuItemId);

    @Query("SELECT bmi FROM BranchMenuItem bmi JOIN FETCH bmi.menuItem mi " +
           "WHERE bmi.branch.id = :branchId AND mi.isDeleted = false")
    Page<BranchMenuItem> findAllByBranchIdWithMenuItem(UUID branchId, Pageable pageable);

    @Query("SELECT bmi FROM BranchMenuItem bmi JOIN FETCH bmi.menuItem mi " +
           "WHERE bmi.branch.id = :branchId AND bmi.isAvailable = :isAvailable AND mi.isDeleted = false")
    Page<BranchMenuItem> findAllByBranchIdAndIsAvailableWithMenuItem(UUID branchId, boolean isAvailable, Pageable pageable);
}
