package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateMenuItemRequest;
import com.example.traphe_backend.dto.request.UpdateMenuItemRequest;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.MenuCategory;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemOptionGroup;
import com.example.traphe_backend.entity.MenuItemSize;
import com.example.traphe_backend.entity.MenuItemTopping;
import com.example.traphe_backend.entity.OptionGroup;
import com.example.traphe_backend.entity.OptionValue;
import com.example.traphe_backend.entity.Topping;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.MenuItemMapper;
import com.example.traphe_backend.mapper.OptionGroupMapper;
import com.example.traphe_backend.mapper.ToppingMapper;
import com.example.traphe_backend.repository.MenuCategoryRepository;
import com.example.traphe_backend.repository.MenuItemOptionGroupRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.MenuItemSizeRepository;
import com.example.traphe_backend.repository.MenuItemToppingRepository;
import com.example.traphe_backend.repository.OptionGroupRepository;
import com.example.traphe_backend.repository.OptionValueRepository;
import com.example.traphe_backend.repository.ToppingRepository;
import com.example.traphe_backend.repository.IngredientRepository;
import com.example.traphe_backend.entity.Ingredient;
import com.example.traphe_backend.service.AdminMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminMenuServiceImpl implements AdminMenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final MenuItemOptionGroupRepository menuItemOptionGroupRepository;
    private final MenuItemToppingRepository menuItemToppingRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final OptionGroupRepository optionGroupRepository;
    private final OptionValueRepository optionValueRepository;
    private final ToppingRepository toppingRepository;
    private final IngredientRepository ingredientRepository;

    private final MenuItemMapper menuItemMapper;
    private final OptionGroupMapper optionGroupMapper;
    private final ToppingMapper toppingMapper;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "menu:items", allEntries = true),
            @CacheEvict(value = "menu:item-detail", allEntries = true),
            @CacheEvict(value = "menu:tree", allEntries = true)
    })
    public MenuItemDetailResponse createMenuItem(CreateMenuItemRequest request) {
        // Resolve category
        MenuCategory category = null;
        if (request.getCategoryId() != null) {
            category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));
        }

        // Resolve ingredient explicitly if provided
        Ingredient ingredient = null;
        if (request.getIngredientId() != null) {
            ingredient = ingredientRepository.findById(request.getIngredientId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Ingredient not found with id: " + request.getIngredientId()));
        }

        // Build menu item
        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .category(category)
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .isDrink(Boolean.TRUE.equals(request.getIsDrink()))
                .basePrice(request.getBasePrice())
                .ingredient(ingredient)
                .preparationTime(request.getPreparationTime())
                .allowToppings(request.getAllowToppings() != null ? request.getAllowToppings() : true)
                .status(MenuItemStatus.ACTIVE)
                .build();

        menuItemRepository.save(item);
        log.info("Created menu item: {} ({})", item.getName(), item.getId());

        // Create sizes
        List<MenuItemSize> sizes = List.of();
        if (request.getSizes() != null && !request.getSizes().isEmpty()) {
            sizes = request.getSizes().stream()
                    .map(sr -> MenuItemSize.builder()
                            .menuItem(item)
                            .sizeName(sr.getSizeName())
                            .sellingPrice(sr.getSellingPrice())
                            .displayOrder(sr.getDisplayOrder() != null ? sr.getDisplayOrder() : 0)
                            .build())
                    .toList();
            menuItemSizeRepository.saveAll(sizes);
        }

        // Link option groups
        List<OptionGroupResponse> optionGroups = List.of();
        if (request.getOptionGroupIds() != null && !request.getOptionGroupIds().isEmpty()) {
            List<MenuItemOptionGroup> links = request.getOptionGroupIds().stream()
                    .map(ogId -> {
                        OptionGroup og = optionGroupRepository.findById(ogId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Option group not found: " + ogId));
                        return MenuItemOptionGroup.builder()
                                .menuItem(item)
                                .optionGroup(og)
                                .build();
                    })
                    .toList();
            menuItemOptionGroupRepository.saveAll(links);

            optionGroups = links.stream()
                    .map(link -> {
                        List<OptionValue> values = optionValueRepository
                                .findByOptionGroupIdOrderBySortOrderAsc(link.getOptionGroup().getId());
                        return optionGroupMapper.toResponse(link.getOptionGroup(), values);
                    })
                    .toList();
        }

        // Link toppings
        List<ToppingResponse> toppings = List.of();
        if (request.getToppingIds() != null && !request.getToppingIds().isEmpty()) {
            List<MenuItemTopping> toppingLinks = request.getToppingIds().stream()
                    .map(tId -> {
                        Topping t = toppingRepository.findById(tId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Topping not found: " + tId));
                        return MenuItemTopping.builder()
                                .menuItem(item)
                                .topping(t)
                                .build();
                    })
                    .toList();
            menuItemToppingRepository.saveAll(toppingLinks);

            toppings = toppingLinks.stream()
                    .map(tl -> toppingMapper.toResponse(tl.getTopping()))
                    .toList();
        }

        return menuItemMapper.toDetailResponse(item, sizes, optionGroups, toppings);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "menu:items", allEntries = true),
            @CacheEvict(value = "menu:item-detail", allEntries = true),
            @CacheEvict(value = "menu:tree", allEntries = true)
    })
    public MenuItemDetailResponse updateMenuItem(UUID id, UpdateMenuItemRequest request) {
        MenuItem item = menuItemRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        // Update basic fields (only if provided)
        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getIsDrink() != null) item.setDrink(request.getIsDrink());
        if (request.getBasePrice() != null) item.setBasePrice(request.getBasePrice());
        if (request.getPreparationTime() != null) item.setPreparationTime(request.getPreparationTime());
        if (request.getAllowToppings() != null) item.setAllowToppings(request.getAllowToppings());
        if (request.getStatus() != null) {
            item.setStatus(MenuItemStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getCategoryId() != null) {
            MenuCategory cat = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found: " + request.getCategoryId()));
            item.setCategory(cat);
        }
        if (request.getIngredientId() != null) {
            Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Ingredient not found: " + request.getIngredientId()));
            item.setIngredient(ingredient);
        }

        menuItemRepository.save(item);
        log.info("Updated menu item: {} ({})", item.getName(), item.getId());

        // Replace sizes if provided
        List<MenuItemSize> sizes;
        if (request.getSizes() != null) {
            // Soft-delete existing sizes
            List<MenuItemSize> existing = menuItemSizeRepository
                    .findByMenuItemIdAndIsDeletedFalseOrderByDisplayOrderAsc(id);
            existing.forEach(s -> {
                s.setDeleted(true);
                s.setDeletedAt(LocalDateTime.now());
            });
            menuItemSizeRepository.saveAll(existing);

            // Create new sizes
            sizes = request.getSizes().stream()
                    .map(sr -> MenuItemSize.builder()
                            .menuItem(item)
                            .sizeName(sr.getSizeName())
                            .sellingPrice(sr.getSellingPrice())
                            .displayOrder(sr.getDisplayOrder() != null ? sr.getDisplayOrder() : 0)
                            .build())
                    .toList();
            menuItemSizeRepository.saveAll(sizes);
        } else {
            sizes = menuItemSizeRepository.findByMenuItemIdAndIsDeletedFalseOrderByDisplayOrderAsc(id);
        }

        // Replace option group links if provided
        List<OptionGroupResponse> optionGroups;
        if (request.getOptionGroupIds() != null) {
            menuItemOptionGroupRepository.deleteAllByMenuItemId(id);
            List<MenuItemOptionGroup> links = request.getOptionGroupIds().stream()
                    .map(ogId -> {
                        OptionGroup og = optionGroupRepository.findById(ogId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Option group not found: " + ogId));
                        return MenuItemOptionGroup.builder()
                                .menuItem(item)
                                .optionGroup(og)
                                .build();
                    })
                    .toList();
            menuItemOptionGroupRepository.saveAll(links);
            optionGroups = links.stream()
                    .map(l -> {
                        List<OptionValue> vals = optionValueRepository
                                .findByOptionGroupIdOrderBySortOrderAsc(l.getOptionGroup().getId());
                        return optionGroupMapper.toResponse(l.getOptionGroup(), vals);
                    })
                    .toList();
        } else {
            List<MenuItemOptionGroup> existing = menuItemOptionGroupRepository.findByMenuItemId(id);
            optionGroups = existing.stream()
                    .map(l -> {
                        List<OptionValue> vals = optionValueRepository
                                .findByOptionGroupIdOrderBySortOrderAsc(l.getOptionGroup().getId());
                        return optionGroupMapper.toResponse(l.getOptionGroup(), vals);
                    })
                    .toList();
        }

        // Replace topping links if provided
        List<ToppingResponse> toppings;
        if (request.getToppingIds() != null) {
            menuItemToppingRepository.deleteAllByMenuItemId(id);
            List<MenuItemTopping> toppingLinks = request.getToppingIds().stream()
                    .map(tId -> {
                        Topping t = toppingRepository.findById(tId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Topping not found: " + tId));
                        return MenuItemTopping.builder()
                                .menuItem(item)
                                .topping(t)
                                .build();
                    })
                    .toList();
            menuItemToppingRepository.saveAll(toppingLinks);
            toppings = toppingLinks.stream()
                    .map(tl -> toppingMapper.toResponse(tl.getTopping()))
                    .toList();
        } else {
            List<MenuItemTopping> existing = menuItemToppingRepository.findByMenuItemIdWithTopping(id);
            toppings = existing.stream()
                    .map(tl -> toppingMapper.toResponse(tl.getTopping()))
                    .toList();
        }

        return menuItemMapper.toDetailResponse(item, sizes, optionGroups, toppings);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "menu:items", allEntries = true),
            @CacheEvict(value = "menu:item-detail", allEntries = true),
            @CacheEvict(value = "menu:tree", allEntries = true)
    })
    public void softDeleteMenuItem(UUID id) {
        MenuItem item = menuItemRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        item.setDeleted(true);
        item.setDeletedAt(LocalDateTime.now());
        menuItemRepository.save(item);
        log.info("Soft-deleted menu item: {} ({})", item.getName(), id);
    }
}
