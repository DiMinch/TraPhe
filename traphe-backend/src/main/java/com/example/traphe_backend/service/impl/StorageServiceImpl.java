package com.example.traphe_backend.service.impl;

import com.example.traphe_backend.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class StorageServiceImpl implements StorageService {

    private final String supabaseUrl;
    private final String serviceKey;
    private final String bucket;
    private final RestTemplate restTemplate;

    public StorageServiceImpl(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service-key}") String serviceKey,
            @Value("${supabase.storage.bucket}") String bucket) {
        this.supabaseUrl = supabaseUrl;
        this.serviceKey = serviceKey;
        this.bucket = bucket;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        ensureBucketExists();

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".jpg";
        String filePath = folder + "/" + UUID.randomUUID() + extension;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filePath;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceKey);
            headers.set("apikey", serviceKey);
            headers.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

            String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + filePath;
            log.info("File uploaded successfully: {}", publicUrl);
            return publicUrl;

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file for upload", e);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("prefixes", List.of(filePath));
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
            log.info("File deleted successfully: {}", filePath);
        } catch (Exception e) {
            log.error("Failed to delete file: {}. Error: {}", filePath, e.getMessage());
            throw new RuntimeException("Failed to delete file: " + filePath, e);
        }
    }

    // ---- Private helpers ----

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed (jpg, png, webp)");
        }
    }

    private void ensureBucketExists() {
        String listUrl = supabaseUrl + "/storage/v1/bucket/" + bucket;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);

        try {
            restTemplate.exchange(listUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        } catch (Exception e) {
            // Bucket doesn't exist — create it
            log.info("Bucket '{}' not found. Creating...", bucket);
            createBucket();
        }
    }

    private void createBucket() {
        String createUrl = supabaseUrl + "/storage/v1/bucket";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "id", bucket,
                "name", bucket,
                "public", true
        );

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(createUrl, HttpMethod.POST, requestEntity, String.class);
            log.info("Bucket '{}' created successfully", bucket);
        } catch (Exception e) {
            log.error("Failed to create bucket '{}': {}", bucket, e.getMessage());
            throw new RuntimeException("Failed to create storage bucket: " + bucket, e);
        }
    }
}
