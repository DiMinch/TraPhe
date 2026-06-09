package com.example.traphe_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Object meta;
    private ErrorDetails error;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ErrorDetails {
        private String code;
        private Object details;
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .meta(null)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> successWithMeta(T data, String message, Object meta) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .meta(meta)
                .error(null)
                .build();
    }

    // Helper automatically mapping PageResponse to standard Data/Meta
    public static <E> ApiResponse<java.util.List<E>> successPagination(PageResponse<E> pageResponse, String message) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("page", pageResponse.getPage());
        meta.put("size", pageResponse.getSize());
        meta.put("totalElements", pageResponse.getTotalElements());
        meta.put("totalPages", pageResponse.getTotalPages());

        return ApiResponse.<java.util.List<E>>builder()
                .success(true)
                .message(message)
                .data(pageResponse.getContent())
                .meta(meta)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return error("INTERNAL_ERROR", message, null);
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return error(code, message, null);
    }

    public static <T> ApiResponse<T> error(String code, String message, Object details) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .meta(null)
                .error(new ErrorDetails(code, details))
                .build();
    }
}
