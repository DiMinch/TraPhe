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
}
