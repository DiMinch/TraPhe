package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MenuItemTopping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemToppingRepository extends JpaRepository<MenuItemTopping, UUID> {

    boolean existsByMenuItemIdAndToppingId(UUID menuItemId, UUID toppingId);

    @Query("SELECT mit FROM MenuItemTopping mit JOIN FETCH mit.topping t " +
           "WHERE mit.menuItem.id = :menuItemId AND t.isDeleted = false")
    List<MenuItemTopping> findByMenuItemIdWithTopping(UUID menuItemId);
}
