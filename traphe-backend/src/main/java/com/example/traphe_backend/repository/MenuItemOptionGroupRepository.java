package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MenuItemOptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemOptionGroupRepository extends JpaRepository<MenuItemOptionGroup, UUID> {

    boolean existsByMenuItemIdAndOptionGroupId(UUID menuItemId, UUID optionGroupId);

    List<MenuItemOptionGroup> findByMenuItemId(UUID menuItemId);

    List<MenuItemOptionGroup> findByMenuItemIdIn(java.util.Set<UUID> menuItemIds);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM MenuItemOptionGroup mit WHERE mit.menuItem.id = :menuItemId")
    void deleteAllByMenuItemId(@org.springframework.data.repository.query.Param("menuItemId") UUID menuItemId);
}
