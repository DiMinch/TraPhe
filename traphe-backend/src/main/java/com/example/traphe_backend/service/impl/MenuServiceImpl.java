package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.response.MenuCategoryResponse;
import com.example.traphe_backend.dto.response.MenuItemDetailResponse;
import com.example.traphe_backend.dto.response.MenuItemResponse;
import com.example.traphe_backend.dto.response.OptionGroupResponse;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    private final MenuItemMapper menuItemMapper;
    private final MenuCategoryMapper menuCategoryMapper;
    private final OptionGroupMapper optionGroupMapper;
    private final ToppingMapper toppingMapper;

    @Override
    public PageResponse<MenuItemResponse> getMenuItems(UUID categoryId, String search, String status,
                                                        Boolean isDrink, UUID branchId,
                                                        int page, int size, String sortBy, String sortDir) {
        Sort sort = buildSort(sortBy, sortDir, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<MenuItem> spec = buildMenuItemSpec(categoryId, search, status, isDrink);

        Page<MenuItem> menuItemPage = menuItemRepository.findAll(spec, pageable);

        List<MenuItemResponse> content = menuItemPage.getContent().stream()
                .map(item -> {
                    List<MenuItemSize> sizes = menuItemSizeRepository
                            .findByMenuItemIdAndIsDeletedFalseOrderByDisplayOrderAsc(item.getId());
                    return menuItemMapper.toResponse(item, sizes);
                })
                .toList();

        return PageResponse.of(content, page, size,
                menuItemPage.getTotalElements(), menuItemPage.getTotalPages());
    }

    @Override
    public MenuItemDetailResponse getMenuItemById(UUID id) {
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

        return menuItemMapper.toDetailResponse(item, sizes, optionGroups, toppings);
    }

    @Override
    public List<MenuCategoryResponse> getCategories(String search, UUID parentId,
                                                     String sortBy, String sortDir) {
        Sort sort = buildSort(sortBy, sortDir, "displayOrder");

        if (search != null && !search.isBlank()) {
            Specification<com.example.traphe_backend.entity.MenuCategory> spec = (root, query, cb) -> {
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
                    .toList();
        }

        if (parentId != null) {
            return menuCategoryRepository.findAllByParentIdAndIsDeletedFalse(parentId, sort).stream()
                    .map(menuCategoryMapper::toResponse)
                    .toList();
        }

        return menuCategoryRepository.findAllByIsDeletedFalse(sort).stream()
                .map(menuCategoryMapper::toResponse)
                .toList();
    }

    @Override
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

    // ---- Private helpers ----

    private Specification<MenuItem> buildMenuItemSpec(UUID categoryId, String search,
                                                      String status, Boolean isDrink) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter soft-deleted
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
}
