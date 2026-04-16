package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MenuItemSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuItemSizeRepository extends JpaRepository<MenuItemSize, UUID> {

    List<MenuItemSize> findByMenuItemIdAndIsDeletedFalseOrderByDisplayOrderAsc(UUID menuItemId);

    /**
     * Batch-fetch sizes for multiple menu items (N+1 fix).
     */
    List<MenuItemSize> findByMenuItemIdInAndIsDeletedFalse(List<UUID> menuItemIds);

    Optional<MenuItemSize> findByIdAndMenuItemId(UUID id, UUID menuItemId);
}
