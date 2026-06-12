package com.example.traphe_backend.ai.repository;

import com.example.traphe_backend.ai.entity.AiAssociationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiAssociationRuleRepository extends JpaRepository<AiAssociationRule, UUID> {
    List<AiAssociationRule> findByAntecedentIdOrderByConfidenceDesc(String antecedentId);
    List<AiAssociationRule> findAllByOrderByLiftDesc();
}
