package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.OptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OptionGroupRepository extends JpaRepository<OptionGroup, UUID> {
}
