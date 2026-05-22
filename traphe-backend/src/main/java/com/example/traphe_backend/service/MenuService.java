package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.MenuTreeResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;

import java.util.UUID;

public interface MenuService {

    PageResponse<MenuItemResponse> getMenuItems(UUID categoryId, String search, String status,
                                                 Boolean isDrink, UUID branchId,
                                                 int page, int size, String sortBy, String sortDir);

    MenuItemDetailResponse getMenuItemById(UUID id, UUID branchId);

    MenuCategoryResponse[] getCategories(String search, UUID parentId, String sortBy, String sortDir);

    PageResponse<ToppingResponse> getToppings(String search, Boolean isAvailable, int page, int size);

    MenuTreeResponse[] getMenuTree(UUID branchId);

    MenuItemDetailResponse findMenuItemByBarcode(String barcode, UUID branchId);
}
