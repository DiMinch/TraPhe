package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

    List<Ingredient> findByIsDeletedFalseOrderByNameAsc();

    Optional<Ingredient> findByIdAndIsDeletedFalse(UUID id);

    List<Ingredient> findAllByIdInAndIsDeletedFalse(Collection<UUID> ids);

    List<Ingredient> findByIsActiveTrueAndIsDeletedFalse();
}
