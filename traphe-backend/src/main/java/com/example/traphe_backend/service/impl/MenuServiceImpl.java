package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.MenuTreeResponse;
import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.BranchMenuItem;
import com.example.traphe_backend.entity.MenuCategory;
import com.example.traphe_backend.entity.MenuItem;
import com.example.traphe_backend.entity.MenuItemOptionGroup;
import com.example.traphe_backend.entity.MenuItemSize;
import com.example.traphe_backend.entity.MenuItemTopping;
import com.example.traphe_backend.entity.OptionValue;
import com.example.traphe_backend.entity.Topping;
import com.example.traphe_backend.enums.MenuItemStatus;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.mapper.MenuCategoryMapper;
import com.example.traphe_backend.mapper.MenuItemMapper;
import com.example.traphe_backend.mapper.OptionGroupMapper;
import com.example.traphe_backend.mapper.ToppingMapper;
import com.example.traphe_backend.repository.BranchMenuItemRepository;
import com.example.traphe_backend.repository.MenuCategoryRepository;
import com.example.traphe_backend.repository.MenuItemOptionGroupRepository;
import com.example.traphe_backend.repository.MenuItemRepository;
import com.example.traphe_backend.repository.MenuItemSizeRepository;
import com.example.traphe_backend.repository.MenuItemToppingRepository;
import com.example.traphe_backend.repository.OptionValueRepository;
import com.example.traphe_backend.repository.ToppingRepository;
import com.example.traphe_backend.service.MenuService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemSizeRepository menuItemSizeRepository;
    private final MenuItemOptionGroupRepository menuItemOptionGroupRepository;
    private final MenuItemToppingRepository menuItemToppingRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final OptionValueRepository optionValueRepository;
    private final ToppingRepository toppingRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;

    private final MenuItemMapper menuItemMapper;
    private final MenuCategoryMapper menuCategoryMapper;
    private final OptionGroupMapper optionGroupMapper;
    private final ToppingMapper toppingMapper;

    @Override
    @Cacheable(value = "menu:items",
            key = "T(java.util.Objects).hash(#categoryId, #search, #status, #isDrink, #branchId, #page, #size, #sortBy, #sortDir)")
    public PageResponse<MenuItemResponse> getMenuItems(UUID categoryId, String search, String status,
                                                        Boolean isDrink, UUID branchId,
                                                        int page, int size, String sortBy, String sortDir) {
        Sort sort = buildSort(sortBy, sortDir, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<MenuItem> spec = buildMenuItemSpec(categoryId, search, status, isDrink);
        Page<MenuItem> menuItemPage = menuItemRepository.findAll(spec, pageable);

        List<MenuItem> items = menuItemPage.getContent();

        // Batch-fetch sizes for all items (N+1 fix)
        List<UUID> itemIds = items.stream().map(MenuItem::getId).toList();
        Map<UUID, List<MenuItemSize>> sizesByItemId = batchFetchSizes(itemIds);

        // Batch-fetch branch overlay if branchId is provided
        Map<UUID, BranchMenuItem> branchOverlay = Collections.emptyMap();
        if (branchId != null && !itemIds.isEmpty()) {
            List<BranchMenuItem> bmis = branchMenuItemRepository
                    .findAllByBranchIdAndMenuItemIdIn(branchId, itemIds);
            branchOverlay = bmis.stream()
                    .collect(Collectors.toMap(bmi -> bmi.getMenuItem().getId(), Function.identity()));
        }

        Map<UUID, BranchMenuItem> finalBranchOverlay = branchOverlay;
        List<MenuItemResponse> content = items.stream()
                .map(item -> {
                    List<MenuItemSize> sizes2 = sizesByItemId.getOrDefault(item.getId(), List.of());
                    MenuItemResponse response = menuItemMapper.toResponse(item, sizes2);

                    // Apply branch overlay
                    if (branchId != null) {
                        BranchMenuItem bmi = finalBranchOverlay.get(item.getId());
                        if (bmi != null) {
                            response.setBranchAvailable(bmi.isAvailable());
                            response.setEffectivePrice(
                                    bmi.getCustomPrice() != null ? bmi.getCustomPrice() : item.getBasePrice());
                            response.setUnavailableReason(bmi.getUnavailableReason());
                        } else {
                            // Not mapped to this branch — treat as available with base price
                            response.setBranchAvailable(true);
                            response.setEffectivePrice(item.getBasePrice());
                        }
                    }

                    return response;
                })
                .toList();

        return PageResponse.of(content, page, size,
                menuItemPage.getTotalElements(), menuItemPage.getTotalPages());
    }

    @Override
    @Cacheable(value = "menu:item-detail", key = "T(java.util.Objects).hash(#id, #branchId)")
    public MenuItemDetailResponse getMenuItemById(UUID id, UUID branchId) {
        MenuItem item = menuItemRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        // Sizes
        List<MenuItemSize> sizes = menuItemSizeRepository
                .findByMenuItemIdAndIsDeletedFalseOrderByDisplayOrderAsc(id);

        // Option groups with values
        List<MenuItemOptionGroup> itemOptionGroups = menuItemOptionGroupRepository.findByMenuItemId(id);
        List<OptionGroupResponse> optionGroups = itemOptionGroups.stream()
                .map(miog -> {
                    List<OptionValue> values = optionValueRepository
                            .findByOptionGroupIdOrderBySortOrderAsc(miog.getOptionGroup().getId());
                    return optionGroupMapper.toResponse(miog.getOptionGroup(), values);
                })
                .toList();

        // Toppings
        List<MenuItemTopping> itemToppings = menuItemToppingRepository.findByMenuItemIdWithTopping(id);
        List<ToppingResponse> toppings = itemToppings.stream()
                .map(mit -> toppingMapper.toResponse(mit.getTopping()))
                .toList();

        MenuItemDetailResponse response = menuItemMapper.toDetailResponse(item, sizes, optionGroups, toppings);

        // Apply branch overlay if branchId is provided
        if (branchId != null) {
            branchMenuItemRepository.findByBranchIdAndMenuItemId(branchId, id)
                    .ifPresent(bmi -> {
                        response.setBranchAvailable(bmi.isAvailable());
                        response.setEffectivePrice(
                                bmi.getCustomPrice() != null ? bmi.getCustomPrice() : item.getBasePrice());
                        response.setUnavailableReason(bmi.getUnavailableReason());
                    });
            if (response.getBranchAvailable() == null) {
                response.setBranchAvailable(true);
                response.setEffectivePrice(item.getBasePrice());
            }
        }

        return response;
    }

    @Override
    @Cacheable(value = "menu:categories", key = "T(java.util.Objects).hash(#search, #parentId, #sortBy, #sortDir)")
    public MenuCategoryResponse[] getCategories(String search, UUID parentId,
                                                     String sortBy, String sortDir) {
        Sort sort = buildSort(sortBy, sortDir, "displayOrder");

        if (search != null && !search.isBlank()) {
            Specification<MenuCategory> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(cb.isFalse(root.get("isDeleted")));
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
                if (parentId != null) {
                    predicates.add(cb.equal(root.get("parent").get("id"), parentId));
                }
                return cb.and(predicates.toArray(new Predicate[0]));
            };
            return menuCategoryRepository.findAll(spec, sort).stream()
                    .map(menuCategoryMapper::toResponse)
                    .toArray(MenuCategoryResponse[]::new);
        }

        if (parentId != null) {
            return menuCategoryRepository.findAllByParentIdAndIsDeletedFalse(parentId, sort).stream()
                    .map(menuCategoryMapper::toResponse)
                    .toArray(MenuCategoryResponse[]::new);
        }

        return menuCategoryRepository.findAllByIsDeletedFalse(sort).stream()
                .map(menuCategoryMapper::toResponse)
                .toArray(MenuCategoryResponse[]::new);
    }

    @Override
    @Cacheable(value = "menu:toppings", key = "T(java.util.Objects).hash(#search, #isAvailable, #page, #size)")
    public PageResponse<ToppingResponse> getToppings(String search, Boolean isAvailable, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Specification<Topping> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (isAvailable != null) {
                predicates.add(cb.equal(root.get("isAvailable"), isAvailable));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Topping> toppingPage = toppingRepository.findAll(spec, pageable);

        List<ToppingResponse> content = toppingPage.getContent().stream()
                .map(toppingMapper::toResponse)
                .toList();

        return PageResponse.of(content, page, size,
                toppingPage.getTotalElements(), toppingPage.getTotalPages());
    }

    @Override
    @Cacheable(value = "menu:tree", key = "#branchId != null ? #branchId.toString() : 'all'")
    public MenuTreeResponse[] getMenuTree(UUID branchId) {
        // Get all active categories
        List<MenuCategory> categories = menuCategoryRepository
                .findAllByIsDeletedFalse(Sort.by("displayOrder").ascending());

        // Get all active menu items
        List<MenuItem> allItems = menuItemRepository
                .findAll(buildMenuItemSpec(null, null, "ACTIVE", null));

        // Group items by category
        Map<UUID, List<MenuItem>> itemsByCategory = allItems.stream()
                .filter(item -> item.getCategory() != null)
                .collect(Collectors.groupingBy(item -> item.getCategory().getId()));

        // Batch-fetch all sizes
        List<UUID> allItemIds = allItems.stream().map(MenuItem::getId).toList();
        Map<UUID, List<MenuItemSize>> sizesByItemId = batchFetchSizes(allItemIds);

        // Batch-fetch branch overlay
        Map<UUID, BranchMenuItem> branchOverlay = Collections.emptyMap();
        if (branchId != null && !allItemIds.isEmpty()) {
            branchOverlay = branchMenuItemRepository
                    .findAllByBranchIdAndMenuItemIdIn(branchId, allItemIds)
                    .stream()
                    .collect(Collectors.toMap(bmi -> bmi.getMenuItem().getId(), Function.identity()));
        }

        Map<UUID, BranchMenuItem> finalBranchOverlay = branchOverlay;

        // Build tree — only root categories (parent == null)
        return categories.stream()
                .filter(cat -> cat.getParent() == null)
                .map(cat -> buildCategoryTree(cat, categories, itemsByCategory,
                        sizesByItemId, finalBranchOverlay, branchId))
                .toArray(MenuTreeResponse[]::new);
    }

    // ---- Private helpers ----

    private MenuTreeResponse buildCategoryTree(MenuCategory category,
                                                List<MenuCategory> allCategories,
                                                Map<UUID, List<MenuItem>> itemsByCategory,
                                                Map<UUID, List<MenuItemSize>> sizesByItemId,
                                                Map<UUID, BranchMenuItem> branchOverlay,
                                                UUID branchId) {
        // Items in this category
        List<MenuItem> categoryItems = itemsByCategory.getOrDefault(category.getId(), List.of());
        List<MenuItemResponse> itemResponses = categoryItems.stream()
                .map(item -> {
                    List<MenuItemSize> sizes = sizesByItemId.getOrDefault(item.getId(), List.of());
                    MenuItemResponse resp = menuItemMapper.toResponse(item, sizes);

                    if (branchId != null) {
                        BranchMenuItem bmi = branchOverlay.get(item.getId());
                        if (bmi != null) {
                            resp.setBranchAvailable(bmi.isAvailable());
                            resp.setEffectivePrice(
                                    bmi.getCustomPrice() != null ? bmi.getCustomPrice() : item.getBasePrice());
                            resp.setUnavailableReason(bmi.getUnavailableReason());
                        } else {
                            resp.setBranchAvailable(true);
                            resp.setEffectivePrice(item.getBasePrice());
                        }
                    }
                    return resp;
                })
                .toList();

        // Subcategories (recursive)
        List<MenuTreeResponse> subCategories = allCategories.stream()
                .filter(sub -> sub.getParent() != null && sub.getParent().getId().equals(category.getId()))
                .map(sub -> buildCategoryTree(sub, allCategories, itemsByCategory,
                        sizesByItemId, branchOverlay, branchId))
                .toList();

        return MenuTreeResponse.builder()
                .categoryId(category.getId())
                .categoryName(category.getName())
                .imageUrl(category.getImageUrl())
                .isDrinkCategory(category.isDrinkCategory())
                .displayOrder(category.getDisplayOrder())
                .items(itemResponses)
                .subCategories(subCategories)
                .build();
    }

    private Map<UUID, List<MenuItemSize>> batchFetchSizes(List<UUID> itemIds) {
        if (itemIds.isEmpty()) return Collections.emptyMap();
        return menuItemSizeRepository.findByMenuItemIdInAndIsDeletedFalse(itemIds)
                .stream()
                .collect(Collectors.groupingBy(s -> s.getMenuItem().getId()));
    }

    private Specification<MenuItem> buildMenuItemSpec(UUID categoryId, String search,
                                                      String status, Boolean isDrink) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), MenuItemStatus.valueOf(status.toUpperCase())));
            }
            if (isDrink != null) {
                predicates.add(cb.equal(root.get("isDrink"), isDrink));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sortBy, String sortDir, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }

    @Override
    public MenuItemDetailResponse findMenuItemByBarcode(String barcode, UUID branchId) {
        MenuItem item = menuItemRepository.findByIngredientBarcodeAndIsDeletedFalse(barcode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm với barcode: " + barcode));
        return getMenuItemById(item.getId(), branchId);
    }
}
