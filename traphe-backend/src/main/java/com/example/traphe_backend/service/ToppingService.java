package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.request.CreateToppingRequest;
import com.example.traphe_backend.dto.request.UpdateToppingRequest;
import com.example.traphe_backend.dto.response.PageResponse;
import com.example.traphe_backend.dto.response.ToppingResponse;

import java.util.UUID;

public interface ToppingService {
    PageResponse<ToppingResponse> getAllToppings(String search, Boolean isAvailable, int page, int size, String sortBy, String sortDir);
    ToppingResponse getToppingById(UUID id);
    ToppingResponse createTopping(CreateToppingRequest request);
    ToppingResponse updateTopping(UUID id, UpdateToppingRequest request);
    void deleteTopping(UUID id);
}
