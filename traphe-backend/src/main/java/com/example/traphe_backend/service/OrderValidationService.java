package com.example.traphe_backend.service;

import com.example.traphe_backend.entity.*;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderValidationService {

    public MenuItem validateAndGetMenuItem(UUID menuItemId, MenuItem menuItem) {
        if (menuItem == null) {
            throw new ResourceNotFoundException("Menu item not found with ID: " + menuItemId);
        }
        if (menuItem.isDeleted() || menuItem.getStatus() != MenuItemStatus.ACTIVE) {
            throw new IllegalArgumentException("Món '" + menuItem.getName() + "' đã ẩn hoặc không còn bán.");
        }
        if (!menuItem.isDrink()) {
            throw new IllegalArgumentException("Món '" + menuItem.getName() + "' không phải đồ uống. Vui lòng sử dụng API phù hợp.");
        }
        return menuItem;
    }

    public BranchMenuItem validateAndGetBranchMenuItem(MenuItem menuItem, Branch branch, BranchMenuItem branchMenuItem) {
        if (branchMenuItem == null) {
            throw new IllegalArgumentException("Món '" + menuItem.getName() + "' không có tại chi nhánh '" + branch.getName() + "'.");
        }
        if (!branchMenuItem.isAvailable()) {
            String reason = branchMenuItem.getUnavailableReason() != null ? " Lý do: " + branchMenuItem.getUnavailableReason() : "";
            throw new IllegalArgumentException("Món '" + menuItem.getName() + "' hiện không bán tại chi nhánh này." + reason);
        }
        return branchMenuItem;
    }

    public MenuItemSize validateAndGetSize(UUID sizeId, MenuItemSize size, MenuItem menuItem) {
        if (size == null || !size.getMenuItem().getId().equals(menuItem.getId())) {
            throw new IllegalArgumentException("Size không hợp lệ cho món '" + menuItem.getName() + "'.");
        }
        if (size.isDeleted()) {
            throw new IllegalArgumentException("Size '" + size.getSizeName() + "' không còn khả dụng.");
        }
        return size;
    }

    public OptionValue validateAndGetOption(UUID groupId, UUID valueId, OptionGroup optionGroup, OptionValue optionValue, MenuItem menuItem, Set<UUID> validOptionGroupIds) {
        if (!validOptionGroupIds.contains(groupId)) {
            String groupName = optionGroup != null ? optionGroup.getName() : groupId.toString();
            throw new IllegalArgumentException("Tuỳ chọn nhóm '" + groupName + "' không hợp lệ cho món '" + menuItem.getName() + "'.");
        }

        if (optionValue == null || !optionValue.getOptionGroup().getId().equals(groupId)) {
            throw new IllegalArgumentException("Giá trị tuỳ chọn không hợp lệ cho nhóm tuỳ chọn đã chọn.");
        }
        return optionValue;
    }

    public void validateRequiredOptionsProvided(MenuItem menuItem, List<MenuItemOptionGroup> validOptionsForThisItem, Set<UUID> providedGroupIds) {
        for (MenuItemOptionGroup miog : validOptionsForThisItem) {
            OptionGroup group = miog.getOptionGroup();
            if (group.isRequired() && !providedGroupIds.contains(group.getId())) {
                throw new IllegalArgumentException("Thiếu tuỳ chọn bắt buộc: '" + group.getName() + "' cho món '" + menuItem.getName() + "'.");
            }
        }
    }

    public void validateToppingsAllowed(MenuItem menuItem) {
        if (!menuItem.isAllowToppings()) {
            throw new IllegalArgumentException("Món '" + menuItem.getName() + "' không cho phép thêm topping.");
        }
    }

    public Topping validateAndGetTopping(UUID toppingId, Topping topping, MenuItem menuItem, Set<UUID> validToppingsForThisItem) {
        if (topping == null) {
            throw new ResourceNotFoundException("Topping not found with ID: " + toppingId);
        }

        if (!topping.isAvailable() || topping.isDeleted()) {
            throw new IllegalArgumentException("Topping '" + topping.getName() + "' hiện không khả dụng.");
        }

        if (!validToppingsForThisItem.contains(topping.getId())) {
            throw new IllegalArgumentException("Topping '" + topping.getName() + "' không có cho món '" + menuItem.getName() + "'.");
        }

        return topping;
    }
}
