package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID>, JpaSpecificationExecutor<Branch> {

    Optional<Branch> findByIdAndIsDeletedFalse(UUID id);

    List<Branch> findByIsActiveTrue();
}

