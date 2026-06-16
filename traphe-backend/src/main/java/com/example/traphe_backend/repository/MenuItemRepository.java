package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID>, JpaSpecificationExecutor<MenuItem> {

    Optional<MenuItem> findByNameAndIsDeletedFalse(String name);

    Optional<MenuItem> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT COUNT(m) FROM MenuItem m WHERE m.isDeleted = false AND m.category.id = :categoryId")
    long countByCategoryId(UUID categoryId);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.ingredient i WHERE i.barcode = :barcode AND m.isDeleted = false AND i.isDeleted = false")
    Optional<MenuItem> findByIngredientBarcodeAndIsDeletedFalse(String barcode);
}
