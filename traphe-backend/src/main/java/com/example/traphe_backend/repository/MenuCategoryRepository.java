package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.MenuCategory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, UUID>, JpaSpecificationExecutor<MenuCategory> {

    List<MenuCategory> findAllByIsDeletedFalse(Sort sort);

    List<MenuCategory> findAllByParentIdAndIsDeletedFalse(UUID parentId, Sort sort);

    Optional<MenuCategory> findByIdAndIsDeletedFalse(UUID id);
}
