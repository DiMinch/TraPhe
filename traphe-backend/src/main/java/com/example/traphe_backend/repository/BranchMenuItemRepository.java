package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.BranchMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchMenuItemRepository extends JpaRepository<BranchMenuItem, UUID> {

    Optional<BranchMenuItem> findByBranchIdAndMenuItemId(UUID branchId, UUID menuItemId);
    List<BranchMenuItem> findByBranchId(UUID branchId);
}
