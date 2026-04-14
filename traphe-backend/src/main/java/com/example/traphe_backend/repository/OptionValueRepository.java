package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.OptionValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OptionValueRepository extends JpaRepository<OptionValue, UUID> {

    Optional<OptionValue> findByIdAndOptionGroupId(UUID id, UUID optionGroupId);
}
