package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.response.NotificationResponse;
import com.example.traphe_backend.entity.Notification;
import com.example.traphe_backend.entity.User;
import com.example.traphe_backend.enums.NotificationType;
import com.example.traphe_backend.event.NotificationEvent;
import com.example.traphe_backend.repository.NotificationRepository;
import com.example.traphe_backend.repository.UserRepository;
import com.example.traphe_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Page.empty();
        }

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN") || r.getName().name().equals("ADMIN"));

        if (isAdmin) {
            return notificationRepository.findAllForAdmin(userId, pageable)
                    .map(this::toResponse);
        } else if (user.getBranch() != null) {
            return notificationRepository.findAllForBranchStaff(userId, user.getBranch().getId(), pageable)
                    .map(this::toResponse);
        } else {
            return notificationRepository.findAllForUserOnly(userId, pageable)
                    .map(this::toResponse);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return 0;
        }

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN") || r.getName().name().equals("ADMIN"));

        if (isAdmin) {
            return notificationRepository.countUnreadForAdmin(userId);
        } else if (user.getBranch() != null) {
            return notificationRepository.countUnreadForBranchStaff(userId, user.getBranch().getId());
        } else {
            return notificationRepository.countUnreadForUserOnly(userId);
        }
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllRead(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN") || r.getName().name().equals("ADMIN"));

        if (isAdmin) {
            notificationRepository.markAllReadForAdmin(userId);
        } else if (user.getBranch() != null) {
            notificationRepository.markAllReadForBranchStaff(userId, user.getBranch().getId());
        } else {
            notificationRepository.markAllReadForUserOnly(userId);
        }
    }

    @Override
    @Transactional
    public void createNotification(String title, String message, NotificationType type, UUID branchId, UUID userId, String sseEventName) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .branchId(branchId)
                .userId(userId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        // Publish event for SSE broadcast
        eventPublisher.publishEvent(new NotificationEvent(response, sseEventName != null ? sseEventName : "ORDER_NEW"));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .branchId(n.getBranchId())
                .title(n.getTitle())
                .content(n.getMessage())
                .type(n.getType().name())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
