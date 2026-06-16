package com.example.traphe_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@RestController
@RequestMapping("/api/benchmark")
public class BenchmarkController {

    @GetMapping("/threads")
    public ResponseEntity<?> benchmarkThreads(@RequestParam(defaultValue = "200") int tasks) {
        long delayMs = 100; // Simulates an I/O network latency (e.g., mail sending, DB querying)

        // 1. Platform Threads (Fixed Pool of 20 - typical for standard tomcat settings under heavy queue)
        long startPlatform = System.currentTimeMillis();
        try (ExecutorService platformExecutor = Executors.newFixedThreadPool(20)) {
            List<Future<?>> futures = new ArrayList<>();
            for (int i = 0; i < tasks; i++) {
                futures.add(platformExecutor.submit(() -> {
                    try {
                        Thread.sleep(delayMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }));
            }
            for (Future<?> future : futures) {
                try {
                    future.get();
                } catch (Exception ignored) {}
            }
        }
        long durationPlatform = System.currentTimeMillis() - startPlatform;

        // 2. Java 21 Virtual Threads
        long startVirtual = System.currentTimeMillis();
        try (ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<?>> futures = new ArrayList<>();
            for (int i = 0; i < tasks; i++) {
                futures.add(virtualExecutor.submit(() -> {
                    try {
                        Thread.sleep(delayMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }));
            }
            for (Future<?> future : futures) {
                try {
                    future.get();
                } catch (Exception ignored) {}
            }
        }
        long durationVirtual = System.currentTimeMillis() - startVirtual;

        double speedup = (double) durationPlatform / durationVirtual;

        return ResponseEntity.ok(Map.of(
                "success", true,
                "tasksCount", tasks,
                "simulationDelayPerTaskMs", delayMs,
                "platformThreadsTimeMs", durationPlatform,
                "virtualThreadsTimeMs", durationVirtual,
                "speedup", String.format("%.2fx", speedup),
                "note", "Virtual threads scale automatically for I/O-bound tasks without blocking OS threads."
        ));
    }
}
