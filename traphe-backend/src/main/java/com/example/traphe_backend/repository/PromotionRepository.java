package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    Optional<Promotion> findByCodeAndIsDeletedFalse(String code);

    List<Promotion> findByIsDeletedFalseOrderByCreatedAtDesc();

    List<Promotion> findByIsActiveTrueAndIsDeletedFalseAndStartDateBeforeAndEndDateAfterOrderByCreatedAtDesc(
            LocalDateTime now1, LocalDateTime now2);
}
