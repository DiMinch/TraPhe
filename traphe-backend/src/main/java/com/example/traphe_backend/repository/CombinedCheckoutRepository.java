package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.CombinedCheckout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CombinedCheckoutRepository extends JpaRepository<CombinedCheckout, UUID> {

    /**
     * Find checkout by transaction reference (idempotency check).
     */
    Optional<CombinedCheckout> findByTransactionRef(String transactionRef);

    /**
     * Check if a drink order or merchandise order has already been checked out.
     */
    boolean existsByDrinkOrderId(UUID drinkOrderId);

    boolean existsByMerchandiseOrderId(UUID merchandiseOrderId);
}
