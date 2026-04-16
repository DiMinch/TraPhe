package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryResponse {
    private UUID id;
    private String name;
    private UUID parentId;
    private int displayOrder;
    private String imageUrl;
    private boolean isDrinkCategory;
}
