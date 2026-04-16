package com.example.traphe_backend.mapper;

import com.example.traphe_backend.dto.response.ToppingResponse;
import com.example.traphe_backend.entity.Topping;
import org.springframework.stereotype.Component;

@Component
public class ToppingMapper {

    public ToppingResponse toResponse(Topping topping) {
        return ToppingResponse.builder()
                .id(topping.getId())
                .name(topping.getName())
                .extraPrice(topping.getExtraPrice())
                .imageUrl(topping.getImageUrl())
                .isAvailable(topping.isAvailable())
                .build();
    }
}
