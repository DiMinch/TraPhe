package com.example.traphe_backend.ai.repository;

import com.example.traphe_backend.ai.entity.CustomerSegment;
import com.example.traphe_backend.ai.enums.CustomerSegmentEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerSegmentRepository extends JpaRepository<CustomerSegment, UUID> {

    Optional<CustomerSegment> findByCustomerId(UUID customerId);

    Page<CustomerSegment> findBySegment(CustomerSegmentEnum segment, Pageable pageable);

    @Query("SELECT c.segment, COUNT(c) FROM CustomerSegment c GROUP BY c.segment")
    List<Object[]> countBySegment();
}
