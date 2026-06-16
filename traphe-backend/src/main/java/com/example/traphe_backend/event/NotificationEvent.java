package com.example.traphe_backend.event;

import com.example.traphe_backend.dto.response.NotificationResponse;
import lombok.Getter;

@Getter
public class NotificationEvent {
    private final NotificationResponse notification;
    private final String eventName;

    public NotificationEvent(NotificationResponse notification, String eventName) {
        this.notification = notification;
        this.eventName = eventName;
    }
}
