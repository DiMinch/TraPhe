package com.example.traphe_backend.service;

import com.example.traphe_backend.dto.response.InventoryOverviewResponse;

public interface InventoryOverviewService {

    InventoryOverviewResponse getOverview(String stockValueTimeRange, String onHandQuantityTimeRange);
}
