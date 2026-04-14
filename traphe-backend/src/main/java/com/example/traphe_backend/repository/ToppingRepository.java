package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Topping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ToppingRepository extends JpaRepository<Topping, UUID> {
}
