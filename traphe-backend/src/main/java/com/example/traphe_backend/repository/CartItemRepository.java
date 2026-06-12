package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    Optional<CartItem> findByIdAndUserIdAndIsDeletedFalse(UUID id, UUID userId);

    /**
     * Find a cart item with the same menu item + configuration hash for merging quantities.
     */
    Optional<CartItem> findByUserIdAndMenuItemIdAndSelectedOptionsHashAndIsDeletedFalse(
            UUID userId, UUID menuItemId, String selectedOptionsHash);

    @Modifying
    @Query("UPDATE CartItem c SET c.isDeleted = true WHERE c.user.id = :userId AND c.isDeleted = false")
    int softDeleteAllByUserId(UUID userId);

    long countByUserIdAndIsDeletedFalse(UUID userId);
}
