package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {

    List<PurchaseOrderItem> findByPurchaseOrderId(UUID purchaseOrderId);

    @Query("SELECT poi FROM PurchaseOrderItem poi JOIN FETCH poi.purchaseOrder LEFT JOIN FETCH poi.ingredient")
    List<PurchaseOrderItem> findAllWithPurchaseOrder();
}
