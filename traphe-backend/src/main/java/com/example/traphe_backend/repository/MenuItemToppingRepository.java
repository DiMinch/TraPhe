package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MenuItemTopping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MenuItemToppingRepository extends JpaRepository<MenuItemTopping, UUID> {

    boolean existsByMenuItemIdAndToppingId(UUID menuItemId, UUID toppingId);
}
