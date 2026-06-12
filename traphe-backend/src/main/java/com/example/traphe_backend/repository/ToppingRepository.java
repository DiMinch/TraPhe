package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Topping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Repository
public interface ToppingRepository extends JpaRepository<Topping, UUID>, JpaSpecificationExecutor<Topping> {

    List<Topping> findAllByIsDeletedFalseAndIsAvailableTrue();

    Page<Topping> findByIsDeletedFalseAndNameContainingIgnoreCaseAndIsAvailable(String name, boolean isAvailable, Pageable pageable);
    Page<Topping> findByIsDeletedFalseAndNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Topping> findByIsDeletedFalseAndIsAvailable(boolean isAvailable, Pageable pageable);
    Page<Topping> findByIsDeletedFalse(Pageable pageable);
}
