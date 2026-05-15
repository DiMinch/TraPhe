package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.BranchMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.traphe_backend.dto.response.report.InventoryReportResponse;

@Repository
public interface BranchMenuItemRepository extends JpaRepository<BranchMenuItem, UUID> {

    Optional<BranchMenuItem> findByBranchIdAndMenuItemId(UUID branchId, UUID menuItemId);
    List<BranchMenuItem> findByBranchId(UUID branchId);

    @Query("SELECT new com.example.traphe_backend.dto.response.report.InventoryReportResponse(b.id, b.name, m.id, m.name, bmi.isAvailable, bmi.unavailableReason) " +
           "FROM BranchMenuItem bmi " +
           "JOIN bmi.branch b " +
           "JOIN bmi.menuItem m " +
           "WHERE (cast(:branchId as uuid) IS NULL OR b.id = :branchId)")
    List<InventoryReportResponse> findInventoryStatus(@Param("branchId") UUID branchId);
}
