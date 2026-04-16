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

    Optional<MenuItem> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT COUNT(m) FROM MenuItem m WHERE m.isDeleted = false AND m.category.id = :categoryId")
    long countByCategoryId(UUID categoryId);
}
