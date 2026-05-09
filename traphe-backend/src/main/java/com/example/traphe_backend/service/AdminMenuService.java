package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateMenuItemRequest;
import com.example.traphe_backend.dto.request.UpdateMenuItemRequest;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;

import java.util.UUID;

public interface AdminMenuService {

    MenuItemDetailResponse createMenuItem(CreateMenuItemRequest request);

    MenuItemDetailResponse updateMenuItem(UUID id, UpdateMenuItemRequest request);

    void softDeleteMenuItem(UUID id);
}
