package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import com.example.traphe_backend.enums.BrewingStatus;
import com.example.traphe_backend.enums.OrderStatus;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBranchIdAndStatusNotAndBrewingStatusNotOrderByCreatedAtAsc(UUID branchId, OrderStatus status, BrewingStatus brewingStatus);
}
