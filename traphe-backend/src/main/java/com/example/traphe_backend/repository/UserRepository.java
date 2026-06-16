package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.RoleName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    List<User> findByRoles_Id(UUID roleId);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE u.isDeleted = false AND u.isActive = true AND r.name = :roleName")
    long countByRoleName(@Param("roleName") RoleName roleName);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE u.isDeleted = false AND u.isActive = true AND r.name = :roleName AND u.createdAt >= :date")
    long countNewCustomers(@Param("roleName") RoleName roleName, @Param("date") java.time.LocalDateTime date);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r JOIN u.loyaltyPoint lp JOIN lp.membershipTier mt WHERE u.isDeleted = false AND u.isActive = true AND r.name = :roleName AND mt.tierLevel >= :minTierLevel")
    long countVipCustomers(@Param("roleName") RoleName roleName, @Param("minTierLevel") int minTierLevel);

    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN u.roles r " +
           "LEFT JOIN FETCH u.loyaltyPoint lp " +
           "LEFT JOIN FETCH lp.membershipTier " +
           "LEFT JOIN FETCH u.customerSegment " +
           "WHERE u.isDeleted = false AND u.isActive = true AND r.name = :roleName")
    List<User> findAllCustomersWithDetails(@Param("roleName") RoleName roleName);

    @Query(value = "SELECT DISTINCT u FROM User u " +
           "JOIN u.roles r " +
           "LEFT JOIN FETCH u.loyaltyPoint lp " +
           "LEFT JOIN FETCH lp.membershipTier " +
           "LEFT JOIN FETCH u.customerSegment " +
           "WHERE u.isDeleted = false AND u.isActive = true AND r.name = :roleName " +
           "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r " +
           "WHERE u.isDeleted = false AND u.isActive = true AND r.name = :roleName " +
           "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findCustomersWithDetails(@Param("roleName") RoleName roleName, @Param("search") String search, Pageable pageable);
}
