package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.BranchMenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
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

    /**
     * Find all branch-menu-item mappings for a branch (with menu item eagerly fetched).
     */
    @Query("SELECT bmi FROM BranchMenuItem bmi JOIN FETCH bmi.menuItem mi " +
           "WHERE bmi.branch.id = :branchId AND mi.isDeleted = false")
    Page<BranchMenuItem> findAllByBranchIdWithMenuItem(UUID branchId, Pageable pageable);

    /**
     * Find branch-menu-item mappings filtered by availability.
     */
    @Query("SELECT bmi FROM BranchMenuItem bmi JOIN FETCH bmi.menuItem mi " +
           "WHERE bmi.branch.id = :branchId AND bmi.isAvailable = :isAvailable AND mi.isDeleted = false")
    Page<BranchMenuItem> findAllByBranchIdAndIsAvailableWithMenuItem(UUID branchId, boolean isAvailable, Pageable pageable);

    /**
     * Find branch-menu-item mappings with search on menu item name.
     */
    @Query("SELECT bmi FROM BranchMenuItem bmi JOIN FETCH bmi.menuItem mi " +
           "WHERE bmi.branch.id = :branchId AND mi.isDeleted = false " +
           "AND LOWER(mi.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<BranchMenuItem> findAllByBranchIdAndSearchWithMenuItem(UUID branchId, String search, Pageable pageable);

    /**
     * Find branch-menu-item mappings with search + availability filter.
     */
    @Query("SELECT bmi FROM BranchMenuItem bmi JOIN FETCH bmi.menuItem mi " +
           "WHERE bmi.branch.id = :branchId AND bmi.isAvailable = :isAvailable " +
           "AND mi.isDeleted = false AND LOWER(mi.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<BranchMenuItem> findAllByBranchIdAndIsAvailableAndSearchWithMenuItem(
            UUID branchId, boolean isAvailable, String search, Pageable pageable);

    /**
     * Batch-fetch all branch-menu-items for a given branch and a list of menu item IDs.
     * Used to avoid N+1 when applying branch overlay to menu queries.
     */
    @Query("SELECT bmi FROM BranchMenuItem bmi WHERE bmi.branch.id = :branchId " +
           "AND bmi.menuItem.id IN :menuItemIds")
    List<BranchMenuItem> findAllByBranchIdAndMenuItemIdIn(UUID branchId, List<UUID> menuItemIds);
}
