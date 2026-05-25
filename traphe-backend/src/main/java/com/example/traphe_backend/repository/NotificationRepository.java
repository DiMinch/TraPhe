package com.example.traphe_backend.repository;

import com.example.traphe_backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByBranchIdAndIsReadFalseOrderByCreatedAtDesc(UUID branchId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

    // For admin: get all notifications (broadcast + targeted to this user), paginated
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId OR n.userId IS NULL")
    Page<Notification> findAllForAdmin(@Param("userId") UUID userId, Pageable pageable);

    // Count unread for admin
    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.userId = :userId OR n.userId IS NULL) AND n.isRead = false")
    long countUnreadForAdmin(@Param("userId") UUID userId);

    // Mark all as read for admin
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.userId = :userId OR n.userId IS NULL) AND n.isRead = false")
    void markAllReadForAdmin(@Param("userId") UUID userId);
}
