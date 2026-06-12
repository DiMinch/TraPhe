package com.example.traphe_backend.controller;

import com.example.traphe_backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Proxy controller for Vietnam administrative location data.
 * Forwards requests to provinces.open-api.vn/api/v2 and wraps the result
 * in our standard ApiResponse format so the frontend can consume it
 * through axiosClient like every other endpoint.
 */
@Slf4j
@RestController
@RequestMapping("/api/address")
@Tag(name = "Address Lookup", description = "Tra cứu dữ liệu hành chính Việt Nam (Tỉnh/Thành phố, Xã/Phường)")
public class AddressLookupController {

    private static final String EXTERNAL_API = "https://provinces.open-api.vn/api/v2";
    private final RestTemplate restTemplate = new RestTemplate();

    // ---- DTOs matching external API shape ----

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ProvinceDto {
        private int code;
        private String name;
        private String codename;
        private String division_type;
        private int phone_code;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class WardDto {
        private int code;
        private String name;
        private String codename;
        private String division_type;
        private String short_codename;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ProvinceWithWardsDto {
        private int code;
        private String name;
        private String codename;
        private String division_type;
        private int phone_code;
        private List<WardDto> wards;
    }

    // ---- Endpoints ----

    @GetMapping("/provinces")
    @Operation(summary = "Danh sách tỉnh/thành phố", description = "Proxy tới provinces.open-api.vn để lấy 34 tỉnh/thành phố (v2 — 2 cấp).")
    public ResponseEntity<ApiResponse<List<ProvinceDto>>> getProvinces() {
        try {
            ProvinceDto[] provinces = restTemplate.getForObject(
                    EXTERNAL_API + "/p/", ProvinceDto[].class);
            List<ProvinceDto> list = provinces != null ? Arrays.asList(provinces) : Collections.emptyList();
            return ResponseEntity.ok(ApiResponse.success(list, "Danh sách tỉnh/thành phố"));
        } catch (Exception e) {
            log.error("Failed to fetch provinces from external API", e);
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList(), "Không thể tải dữ liệu tỉnh/thành phố"));
        }
    }

    @GetMapping("/communes")
    @Operation(summary = "Danh sách xã/phường theo tỉnh", description = "Proxy tới provinces.open-api.vn để lấy danh sách xã/phường theo mã tỉnh.")
    public ResponseEntity<ApiResponse<List<WardDto>>> getCommunes(
            @RequestParam String provinceCode) {
        try {
            ProvinceWithWardsDto province = restTemplate.getForObject(
                    EXTERNAL_API + "/p/" + provinceCode + "?depth=2",
                    ProvinceWithWardsDto.class);
            List<WardDto> wards = province != null && province.getWards() != null
                    ? province.getWards()
                    : Collections.emptyList();
            return ResponseEntity.ok(ApiResponse.success(wards, "Danh sách xã/phường"));
        } catch (Exception e) {
            log.error("Failed to fetch communes from external API for province {}", provinceCode, e);
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList(), "Không thể tải dữ liệu xã/phường"));
        }
    }
}
