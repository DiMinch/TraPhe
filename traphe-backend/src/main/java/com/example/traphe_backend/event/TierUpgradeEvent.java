package com.example.traphe_backend.event;

import com.example.traphe_backend.entity.MembershipTier;
import com.example.traphe_backend.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TierUpgradeEvent extends ApplicationEvent {
    private final User user;
    private final MembershipTier newTier;

    public TierUpgradeEvent(Object source, User user, MembershipTier newTier) {
        super(source);
        this.user = user;
        this.newTier = newTier;
    }
}
