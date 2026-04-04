package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.UserProvider;
import com.example.traphe_backend.enums.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProviderRepository extends JpaRepository<UserProvider, UUID> {
    Optional<UserProvider> findByProviderAndProviderId(AuthProvider provider, String providerId);
}
