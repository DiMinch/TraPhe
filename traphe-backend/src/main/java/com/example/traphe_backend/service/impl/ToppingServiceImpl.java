package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.dto.request.CreateToppingRequest;
import com.example.traphe_backend.dto.request.UpdateToppingRequest;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.Topping;
import com.example.traphe_backend.exception.ResourceNotFoundException;
import com.example.traphe_backend.repository.ToppingRepository;
import com.example.traphe_backend.service.ToppingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ToppingServiceImpl implements ToppingService {

    private final ToppingRepository toppingRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ToppingResponse> getAllToppings(String search, Boolean isAvailable, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));

        Page<Topping> toppingPage;

        if (search != null && !search.trim().isEmpty()) {
            if (isAvailable != null) {
                toppingPage = toppingRepository.findByIsDeletedFalseAndNameContainingIgnoreCaseAndIsAvailable(search, isAvailable, pageable);
            } else {
                toppingPage = toppingRepository.findByIsDeletedFalseAndNameContainingIgnoreCase(search, pageable);
            }
        } else {
            if (isAvailable != null) {
                toppingPage = toppingRepository.findByIsDeletedFalseAndIsAvailable(isAvailable, pageable);
            } else {
                toppingPage = toppingRepository.findByIsDeletedFalse(pageable);
            }
        }

        List<ToppingResponse> content = toppingPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<ToppingResponse>builder()
                .content(content)
                .page(toppingPage.getNumber() + 1)
                .size(toppingPage.getSize())
                .totalElements(toppingPage.getTotalElements())
                .totalPages(toppingPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ToppingResponse getToppingById(UUID id) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found with id: " + id));
        return mapToResponse(topping);
    }

    @Override
    @Transactional
    public ToppingResponse createTopping(CreateToppingRequest request) {
        Topping topping = Topping.builder()
                .name(request.getName())
                .extraPrice(request.getExtraPrice())
                .imageUrl(request.getImageUrl())
                .isAvailable(true)
                .build();

        topping = toppingRepository.save(topping);
        return mapToResponse(topping);
    }

    @Override
    @Transactional
    public ToppingResponse updateTopping(UUID id, UpdateToppingRequest request) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found with id: " + id));

        topping.setName(request.getName());
        topping.setExtraPrice(request.getExtraPrice());
        
        if (request.getIsAvailable() != null) {
            topping.setAvailable(request.getIsAvailable());
        }
        
        if (request.getImageUrl() != null) {
            topping.setImageUrl(request.getImageUrl());
        }

        topping = toppingRepository.save(topping);
        return mapToResponse(topping);
    }

    @Override
    @Transactional
    public void deleteTopping(UUID id) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topping not found with id: " + id));
        
        topping.setDeleted(true);
        topping.setAvailable(false);
        topping.setDeletedAt(java.time.LocalDateTime.now());
        toppingRepository.save(topping);
    }

    private ToppingResponse mapToResponse(Topping topping) {
        return ToppingResponse.builder()
                .id(topping.getId())
                .name(topping.getName())
                .extraPrice(topping.getExtraPrice())
                .imageUrl(topping.getImageUrl())
                .isAvailable(topping.isAvailable())
                .build();
    }
}
