package com.example.traphe_backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * Upload a file to Supabase Storage.
     *
     * @param file   the file to upload
     * @param folder the folder path within the bucket (e.g., "menu-items", "categories")
     * @return the public URL of the uploaded file
     */
    String uploadFile(MultipartFile file, String folder);

    /**
     * Delete a file from Supabase Storage.
     *
     * @param filePath the path of the file within the bucket (e.g., "menu-items/uuid.jpg")
     */
    void deleteFile(String filePath);
}
